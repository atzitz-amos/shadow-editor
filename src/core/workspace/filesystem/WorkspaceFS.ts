import {WorkspaceDirectory} from "./tree/WorkspaceDirectory";
import {RelativePath, RelativePathInput} from "./path/RelativePath";
import {NodeEntry} from "./tree/NodeEntry";
import {WorkspaceFile} from "./tree/WorkspaceFile";
import {FSImpl} from "./impl/FSImpl";
import {MetadataStore} from "./metadata/MetadataStore";
import {NodeMetadata} from "./metadata/NodeMetadata";

/**
 *
 * @author Atzitz Amos
 * @date 3/17/2026
 * @since 1.0.0
 */
export class WorkspaceFS {
    private readonly name: string;

    private readonly virtualHandle: FileSystemDirectoryHandle;
    private readonly metadataStore: MetadataStore;

    private linkedHandle: FileSystemDirectoryHandle | null = null;

    private root: WorkspaceDirectory;

    /**
     * Cache of already materialized entries by parent directory handle + child name.
     *
     * This avoids repeated wrapper allocations and repeated handle lookups for hot paths
     * (e.g. frequent getEntry/exists calls from UI).
     */
    private readonly childrenCache: Map<FileSystemDirectoryHandle, Map<string, NodeEntry>> = new Map();

    constructor(name: string, virtualHandle: FileSystemDirectoryHandle) {
        this.virtualHandle = virtualHandle;

        this.name = name;
        this.metadataStore = new MetadataStore(this);
    }

    public static isNotFoundError(e: unknown): boolean {
        return e instanceof DOMException && e.name === "NotFoundError";
    }

    public getRoot(): WorkspaceDirectory {
        return this.root;
    }

    async init() {
        this.root = new WorkspaceDirectory(this, this.name, null, await this.virtualHandle.getDirectoryHandle(this.name, {create: true}));
    }

    public setLinkedHandle(handle: FileSystemDirectoryHandle) {
        this.linkedHandle = handle;
    }

    async createDir(parent: WorkspaceDirectory, name: string): Promise<WorkspaceDirectory>;

    async createDir(path: RelativePathInput, name: string): Promise<WorkspaceDirectory>;

    async createDir(arg: WorkspaceDirectory | RelativePathInput, name: string): Promise<WorkspaceDirectory> {
        if (!(arg instanceof WorkspaceDirectory)) {
            arg = await this.getDir(arg);
        }
        const handle = await FSImpl.createSubDir(arg.getHandle(), name);
        return this.getOrCreateChild(arg, name, handle) as WorkspaceDirectory;
    }

    async createFile(parent: WorkspaceDirectory, name: string): Promise<WorkspaceFile>;

    async createFile(path: RelativePathInput, name: string): Promise<WorkspaceFile>;

    async createFile(arg: WorkspaceDirectory | RelativePathInput, name: string): Promise<WorkspaceFile> {
        if (!(arg instanceof WorkspaceDirectory)) {
            arg = await this.getDir(arg);
        }
        const handle = await FSImpl.createFile(arg.getHandle(), name);
        return this.getOrCreateChild(arg, name, handle) as WorkspaceFile;
    }

    async getEntry(path: RelativePathInput): Promise<NodeEntry> {
        const rp = RelativePath.of(path);
        if (rp.isEmpty()) {
            return this.getRoot();
        }

        if (rp.getSegments()[0] === this.name) {
            // Special case for root: if the first segment matches the workspace name, skip it.
            return this.getEntry(RelativePath.of(rp.getSegments().slice(1)));
        }

        // Walk directories until reaching the parent of the leaf name.
        let current: WorkspaceDirectory = this.getRoot();
        const segments = rp.getSegments();

        for (let i = 0; i < segments.length; i++) {
            const seg = segments[i];
            const isLeaf = i === segments.length - 1;

            if (isLeaf) {
                // First consult cache.
                const cached = this.getCachedChild(current.getHandle(), seg);
                if (cached) {
                    return cached;
                }

                // Prefer directory first, then file.
                try {
                    const dirHandle = await current.getHandle().getDirectoryHandle(seg, {create: false});
                    return this.getOrCreateChild(current, seg, dirHandle) as WorkspaceDirectory;
                } catch (e) {
                    if (!WorkspaceFS.isNotFoundError(e)) throw e;
                }

                try {
                    const fileHandle = await current.getHandle().getFileHandle(seg, {create: false});
                    return this.getOrCreateChild(current, seg, fileHandle) as WorkspaceFile;
                } catch (e) {
                    if (WorkspaceFS.isNotFoundError(e)) {
                        throw new Error(`Entry does not exist at path: ${rp.toString()}`);
                    }
                    throw e;
                }
            }

            // Intermediate segment must be a directory.
            const cached = this.getCachedChild(current.getHandle(), seg);
            if (cached) {
                if (cached instanceof WorkspaceDirectory) {
                    current = cached;
                    continue;
                }
                throw new Error(`Expected a directory at path ${RelativePath.of(segments.slice(0, i + 1)).toString()}, but found a file.`);
            }

            try {
                const dirHandle = await current.getHandle().getDirectoryHandle(seg, {create: false});
                current = this.getOrCreateChild(current, seg, dirHandle) as WorkspaceDirectory;
            } catch (e) {
                if (WorkspaceFS.isNotFoundError(e)) {
                    throw new Error(`Directory does not exist at path: ${RelativePath.of(segments.slice(0, i + 1)).toString()}`);
                }
                throw e;
            }
        }

        // Unreachable because rp is non-empty.
        return this.getRoot();
    }

    async getDir(path: RelativePathInput): Promise<WorkspaceDirectory> {
        let node = await this.getEntry(path);
        if (!(node instanceof WorkspaceDirectory)) {
            throw new Error(`Expected a directory at path ${path}, but found a file.`);
        }
        return node as WorkspaceDirectory;
    }

    async getFile(path: RelativePathInput): Promise<WorkspaceFile> {
        let node = await this.getEntry(path);
        if (!(node instanceof WorkspaceFile)) {
            throw new Error(`Expected a file at path ${path}, but found a directory.`);
        }
        return node as WorkspaceFile;
    }

    async exists(entry: NodeEntry): Promise<boolean>;

    async exists(path: RelativePathInput): Promise<boolean>;

    async exists(arg: NodeEntry | RelativePathInput): Promise<boolean> {
        if (typeof arg === "string" || Array.isArray(arg) || arg instanceof RelativePath) {
            const rp = RelativePath.of(arg as RelativePathInput);
            if (rp.isEmpty()) {
                return true;
            }

            let dirHandle: FileSystemDirectoryHandle = this.getRoot().getHandle();
            const segments = rp.getSegments();

            for (let i = 0; i < segments.length; i++) {
                const seg = segments[i];
                const isLeaf = i === segments.length - 1;

                if (isLeaf) {
                    // Cache can short-circuit.
                    if (this.getCachedChild(dirHandle, seg)) {
                        return true;
                    }
                    try {
                        await dirHandle.getDirectoryHandle(seg, {create: false});
                        return true;
                    } catch (e) {
                        if (!WorkspaceFS.isNotFoundError(e)) throw e;
                    }
                    try {
                        await dirHandle.getFileHandle(seg, {create: false});
                        return true;
                    } catch (e) {
                        if (WorkspaceFS.isNotFoundError(e)) return false;
                        throw e;
                    }
                }

                // Intermediate: must be directory.
                const cached = this.getCachedChild(dirHandle, seg);
                if (cached) {
                    if (!(cached instanceof WorkspaceDirectory)) return false;
                    dirHandle = cached.getHandle();
                    continue;
                }

                try {
                    dirHandle = await dirHandle.getDirectoryHandle(seg, {create: false});
                } catch (e) {
                    if (WorkspaceFS.isNotFoundError(e)) return false;
                    throw e;
                }
            }
            return false;
        }

        // NodeEntry overload: check by parent + name (root always exists).
        const entry = arg as NodeEntry;
        const parent = entry.getParent();
        if (!parent) return true;

        const name = entry.getHandle().name;
        if (this.getCachedChild(parent.getHandle(), name)) {
            return true;
        }

        try {
            await parent.getHandle().getDirectoryHandle(name, {create: false});
            return true;
        } catch (e) {
            if (!WorkspaceFS.isNotFoundError(e)) throw e;
        }
        try {
            await parent.getHandle().getFileHandle(name, {create: false});
            return true;
        } catch (e) {
            if (WorkspaceFS.isNotFoundError(e)) return false;
            throw e;
        }
    }

    async isFile(entry: NodeEntry): Promise<boolean>;

    async isFile(path: RelativePathInput): Promise<boolean>;

    async isFile(arg: NodeEntry | RelativePathInput): Promise<boolean> {
        if (typeof arg === "string" || Array.isArray(arg) || arg instanceof RelativePath) {
            const entry = await this.getEntry(arg);
            return entry instanceof WorkspaceFile;
        }
        return arg instanceof WorkspaceFile;
    }

    async isDirectory(entry: NodeEntry): Promise<boolean>;

    async isDirectory(path: RelativePathInput): Promise<boolean>;

    async isDirectory(arg: NodeEntry | RelativePathInput): Promise<boolean> {
        if (typeof arg === "string" || Array.isArray(arg) || arg instanceof RelativePath) {
            const entry = await this.getEntry(arg);
            return entry instanceof WorkspaceDirectory;
        }
        return arg instanceof WorkspaceDirectory;
    }

    async deleteEntry(entry: NodeEntry): Promise<void>;

    async deleteEntry(path: RelativePathInput): Promise<void>;

    async deleteEntry(arg: NodeEntry | RelativePathInput): Promise<void> {
        if (typeof arg === "string" || Array.isArray(arg) || arg instanceof RelativePath) {
            arg = await this.getEntry(arg);
        }

        let parent = arg.getParent();
        if (!parent) throw new Error("Cannot delete root directory");

        await FSImpl.deleteEntry(parent.getHandle(), arg.getHandle().name);

        // Keep cache coherent.
        this.invalidateChild(parent.getHandle(), arg.getHandle().name);
    }

    async recursiveGetAllFiles(dir?: WorkspaceDirectory): Promise<WorkspaceFile[]> {
        if (!dir) {
            dir = this.getRoot();
        }
        const files: WorkspaceFile[] = [];

        for await (const [name, handle] of dir.getHandle().entries()) {
            const entry = this.getOrCreateChild(dir, name, handle);
            if (entry instanceof WorkspaceFile) {
                files.push(entry);
            } else if (entry instanceof WorkspaceDirectory) {
                const subFiles = await this.recursiveGetAllFiles(entry);
                files.push(...subFiles);
            }
        }

        return files;
    }

    async getMetadata(path: RelativePathInput): Promise<NodeMetadata>;
    async getMetadata(file: WorkspaceFile): Promise<NodeMetadata>;

    async getMetadata(arg: RelativePathInput | WorkspaceFile): Promise<NodeMetadata | null> {
        if (typeof arg === "string" || Array.isArray(arg) || arg instanceof RelativePath) {
            return this.metadataStore.getMetadata(RelativePath.of(arg));
        }
        return this.metadataStore.getMetadata(arg.getPath());
    }

    async getChildren(parent: WorkspaceDirectory): Promise<NodeEntry[]> {
        const entries: NodeEntry[] = [];
        const handle = parent.getHandle();
        for await (const [name, childHandle] of handle.entries()) {
            entries.push(this.getOrCreateChild(parent, name, childHandle));
        }
        return entries;
    }

    private getOrCreateChild(parent: WorkspaceDirectory, name: string, handle: FileSystemHandle): NodeEntry {
        const parentHandle = parent.getHandle();
        const cached = this.getCachedChild(parentHandle, name);
        if (cached) {
            const wantsDirectory = handle.kind === "directory";
            const matchesKind = wantsDirectory ? cached instanceof WorkspaceDirectory : cached instanceof WorkspaceFile;
            if (matchesKind) {
                return cached;
            }
        }

        let entry: NodeEntry;
        if (handle.kind === "directory") {
            entry = new WorkspaceDirectory(this, name, parent, handle as FileSystemDirectoryHandle);
        } else {
            entry = new WorkspaceFile(this, name, parent, handle as FileSystemFileHandle);
        }
        this.cacheChild(parentHandle, name, entry);
        return entry;
    }

    private getCachedChild(parentHandle: FileSystemDirectoryHandle, name: string): NodeEntry | undefined {
        return this.childrenCache.get(parentHandle)?.get(name);
    }

    private cacheChild(parentHandle: FileSystemDirectoryHandle, name: string, entry: NodeEntry): void {
        let map = this.childrenCache.get(parentHandle);
        if (!map) {
            map = new Map();
            this.childrenCache.set(parentHandle, map);
        }
        map.set(name, entry);
    }

    private invalidateChild(parentHandle: FileSystemDirectoryHandle, name: string): void {
        this.childrenCache.get(parentHandle)?.delete(name);
    }
}
