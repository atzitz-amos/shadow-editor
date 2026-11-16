import {FileSystem} from "./FileSystem";
import {RelativePath, RelativePathInput} from "./path/RelativePath";
import {FileSystemEntry} from "./tree/FileSystemEntry";
import {ProjectDirectory} from "./tree/ProjectDirectory";
import {ProjectFile} from "./tree/ProjectFile";
import {GlobalState} from "../../global/GlobalState";
import {EventBus} from "../../events/EventBus";
import {VContentNode, VNode} from "./metadata/VNode";
import {FileContentLostError} from "./FileContentLostError";
import {Logger} from "../../logging/logger/LoggerCore";
import {VNodeStore} from "./metadata/VNodeStore";
import {DirectoryCreatedEvent} from "../events/DirectoryCreatedEvent";
import {FileCreatedEvent} from "../events/FileCreatedEvent";
import {UUIDHelper} from "../../utils/UUIDHelper";
import {EntryRenamedEvent} from "../events/EntryRenamedEvent";
import {EntryDeletedEvent} from "../events/EntryDeletedEvent";
import {BinaryContent, ProjectBinaryFile} from "./tree/ProjectBinaryFile";
import {BinaryFileCreatedEvent} from "../events/BinaryFileCreatedEvent";

export type FileListing = { id: string, path: string };
export type FileDump = { path: string, content: string };

/**
 *
 * @author Atzitz Amos
 * @date 8/10/2026
 * @since 1.0.0
 */
export class ProjectVFS implements FileSystem {
    private static readonly encoder = new TextEncoder();
    private static readonly logger: Logger = Logger.for("ProjectVFS");

    private readonly name: string;

    private readonly vNodeStore: VNodeStore;
    private readonly virtualHandle: FileSystemDirectoryHandle;
    private blobsHandle: FileSystemDirectoryHandle;

    private readonly eventBus: EventBus;

    private root: ProjectDirectory;
    private rootVNode: VNode;

    /** One entry object per VNode id. Filled lazily and cleaned up on delete. */
    private readonly childrenCache = new Map<string, FileSystemEntry>();

    /**
     * OPFS blob handles, so that each lookup usually happens once per file. Only handles found on disk are cached, and
     * a handle whose file disappears afterwards is dropped by the next read or write that fails on it.
     */
    private readonly blobHandles = new Map<string, Promise<FileSystemFileHandle>>();

    constructor(name: string, virtualHandle: FileSystemDirectoryHandle) {
        this.vNodeStore = VNodeStore.getInstance();
        this.virtualHandle = virtualHandle;
        this.eventBus = GlobalState.getMainEventBus();
        this.name = name;
    }

    private static isPathInput(arg: unknown): arg is RelativePathInput {
        return typeof arg === "string" || Array.isArray(arg) || arg instanceof RelativePath;
    }

    private static createEntry(fs: ProjectVFS, vNode: VNode): FileSystemEntry {
        switch (vNode.kind) {
            case "file":
                return new ProjectFile(fs, vNode);
            case "binary":
                return new ProjectBinaryFile(fs, vNode);
            case "directory":
                return new ProjectDirectory(fs, vNode);
        }
    }

    // ------------------------------------------------------------------ creation

    private static describe(entry: FileSystemEntry): string {
        if (entry.isDirectory()) return "a directory";
        if (entry.isBinaryFile()) return "a binary file";
        return "a text file";
    }

    async init(): Promise<void> {
        this.blobsHandle = await this.virtualHandle.getDirectoryHandle("blobs", {create: true});
        this.rootVNode = this.vNodeStore.getRoot(this.name);
        this.root = new ProjectDirectory(this, this.rootVNode);

        this.childrenCache.set(this.root.getId(), this.root);
    }

    getRoot(): ProjectDirectory {
        return this.root;
    }

    createDir(parent: ProjectDirectory, name: string): ProjectDirectory;

    createDir(path: RelativePathInput, name: string): ProjectDirectory;

    createDir(arg: ProjectDirectory | RelativePathInput, name: string): ProjectDirectory {
        const parent = arg instanceof ProjectDirectory ? arg : this.getDir(arg);
        const now = Date.now();
        const id = UUIDHelper.newUUID();

        const vNode = this.vNodeStore.createDir(id, name, parent.getId(), now, now, null);
        const child = new ProjectDirectory(this, vNode);
        this.childrenCache.set(id, child);

        this.eventBus.syncPublish(new DirectoryCreatedEvent(child));
        return child;
    }

    // ------------------------------------------------------------------ lookup

    createFile(parent: ProjectDirectory, name: string): ProjectFile;

    createFile(path: RelativePathInput, name: string): ProjectFile;

    createFile(arg: ProjectDirectory | RelativePathInput, name: string): ProjectFile {
        const parent = arg instanceof ProjectDirectory ? arg : this.getDir(arg);
        const now = Date.now();
        const id = UUIDHelper.newUUID();

        const vNode = this.vNodeStore.createFile(id, name, parent.getId(), now, now, null, 0, "text/plain");
        const child = new ProjectFile(this, vNode);
        this.childrenCache.set(id, child);

        this.eventBus.syncPublish(new FileCreatedEvent(child));
        return child;
    }

    createBinaryFile(parent: ProjectDirectory, name: string, mimeType?: string): ProjectBinaryFile;

    createBinaryFile(path: RelativePathInput, name: string, mimeType?: string): ProjectBinaryFile;

    createBinaryFile(arg: ProjectDirectory | RelativePathInput, name: string, mimeType = "application/octet-stream"): ProjectBinaryFile {
        const parent = arg instanceof ProjectDirectory ? arg : this.getDir(arg);
        const now = Date.now();
        const id = UUIDHelper.newUUID();

        const vNode = this.vNodeStore.createBinaryFile(id, name, parent.getId(), now, now, null, 0, mimeType);
        const child = new ProjectBinaryFile(this, vNode);
        this.childrenCache.set(id, child);

        this.eventBus.syncPublish(new BinaryFileCreatedEvent(child));
        return child;
    }

    getEntry(path: RelativePathInput): FileSystemEntry {
        const vNode = this.resolveVNode(path);
        if (!vNode) throw new Error("No entry at path: " + RelativePath.of(path).toString());

        return this.getEntryForVNode(vNode);
    }

    getEntryForVNode(vNode: VNode): FileSystemEntry {
        let entry = this.childrenCache.get(vNode.id);
        if (!entry) {
            entry = ProjectVFS.createEntry(this, vNode);
            this.childrenCache.set(vNode.id, entry);
        }
        return entry;
    }

    getEntryById(id: string): FileSystemEntry {
        const vNode = this.vNodeStore.getById(id);
        if (!vNode) throw new Error("No entry with ID: " + id);
        return this.getEntryForVNode(vNode);
    }

    getDir(path: RelativePathInput): ProjectDirectory {
        const node = this.getEntry(path);
        if (!(node instanceof ProjectDirectory)) {
            throw new Error(`Expected a directory at path ${RelativePath.of(path)}, but found ${ProjectVFS.describe(node)}.`);
        }
        return node;
    }

    getFile(path: RelativePathInput): ProjectFile {
        const node = this.getEntry(path);
        if (!(node instanceof ProjectFile)) {
            throw new Error(`Expected a text file at path ${RelativePath.of(path)}, but found ${ProjectVFS.describe(node)}.`);
        }
        return node;
    }

    getBinaryFile(path: RelativePathInput): ProjectBinaryFile {
        const node = this.getEntry(path);
        if (!(node instanceof ProjectBinaryFile)) {
            throw new Error(`Expected a binary file at path ${RelativePath.of(path)}, but found ${ProjectVFS.describe(node)}.`);
        }
        return node;
    }

    exists(entry: FileSystemEntry): boolean;

    exists(path: RelativePathInput): boolean;

    exists(arg: FileSystemEntry | RelativePathInput): boolean {
        if (ProjectVFS.isPathInput(arg)) {
            return this.resolveVNode(arg) != null;
        }
        return this.isLive(arg.getId());
    }

    isFile(entry: FileSystemEntry): boolean;

    isFile(path: RelativePathInput): boolean;

    isFile(arg: FileSystemEntry | RelativePathInput): boolean {
        if (ProjectVFS.isPathInput(arg)) {
            return this.resolveVNode(arg)?.kind === "file";
        }
        return arg instanceof ProjectFile;
    }

    isBinaryFile(entry: FileSystemEntry): boolean;

    isBinaryFile(path: RelativePathInput): boolean;

    isBinaryFile(arg: FileSystemEntry | RelativePathInput): boolean {
        if (ProjectVFS.isPathInput(arg)) {
            return this.resolveVNode(arg)?.kind === "binary";
        }
        return arg instanceof ProjectBinaryFile;
    }

    isDirectory(entry: FileSystemEntry): boolean;

    isDirectory(path: RelativePathInput): boolean;

    // ------------------------------------------------------------------ mutation

    isDirectory(arg: FileSystemEntry | RelativePathInput): boolean {
        if (ProjectVFS.isPathInput(arg)) {
            return this.resolveVNode(arg)?.kind === "directory";
        }
        return arg instanceof ProjectDirectory;
    }

    getPath(entry: FileSystemEntry): RelativePath {
        return RelativePath.of(this.vNodeStore.getPath(entry.getId()));
    }

    deleteEntry(entry: FileSystemEntry): void;

    deleteEntry(path: RelativePathInput): void;

    deleteEntry(arg: FileSystemEntry | RelativePathInput): void {
        const entry = ProjectVFS.isPathInput(arg) ? this.getEntry(arg) : arg;
        if (!entry.getParent()) throw new Error("Cannot delete root directory");

        // Soft delete: entries and blob handles intentionally stay cached (the store keeps the nodes for undo/history).
        this.vNodeStore.delete(entry.getId());

        this.eventBus.syncPublish(new EntryDeletedEvent(entry));
    }

    renameEntry(entry: FileSystemEntry, newName: string): void;

    // ------------------------------------------------------------------ traversal

    renameEntry(path: RelativePathInput, newName: string): void;

    renameEntry(arg: FileSystemEntry | RelativePathInput, newName: string): void {
        const entry = ProjectVFS.isPathInput(arg) ? this.getEntry(arg) : arg;
        if (!entry.getParent()) throw new Error("Cannot rename root directory");

        const oldName = entry.getName();
        this.vNodeStore.rename(entry.getId(), newName);

        this.eventBus.syncPublish(new EntryRenamedEvent(entry, oldName, newName));
    }

    recursiveGetAllFiles(dir: ProjectDirectory = this.root): ProjectFile[] {
        const files: ProjectFile[] = [];
        this.collectFiles(dir, files);
        return files;
    }

    // ------------------------------------------------------------------ content

    getChildren(parent: ProjectDirectory): FileSystemEntry[] {
        return this.vNodeStore.getChildren(parent.getId()).map(vNode => this.getEntryForVNode(vNode));
    }

    async getFileContent(file: ProjectFile): Promise<File> {
        this.assertFileExists(file);
        return this.readBlob(file.getId());
    }

    async write(file: ProjectFile, content: string): Promise<string> {
        this.assertFileExists(file);
        await this.writeBlob(file.getId(), ProjectVFS.encoder.encode(content));
        return content;
    }

    async readBinary(file: ProjectBinaryFile): Promise<File> {
        this.assertFileExists(file);
        return this.readBlob(file.getId());
    }

    // ------------------------------------------------------------------ bulk APIs (for workers / search)

    async writeBinary(file: ProjectBinaryFile, content: BinaryContent): Promise<void> {
        this.assertFileExists(file);
        await this.writeBlob(file.getId(), content);
    }

    /** Cheap metadata only: lets a worker read the blobs itself without content crossing the thread bridge. */
    listFiles(dir: ProjectDirectory = this.root): FileListing[] {
        return this.recursiveGetAllFiles(dir).map(f => ({id: f.getId(), path: this.getPath(f).toString()}));
    }

    /** OPFS handles are structured-cloneable, so a worker can open `blobs/<id>` directly. */
    getBlobsHandle(): FileSystemDirectoryHandle {
        return this.blobsHandle;
    }

    // ------------------------------------------------------------------ internals

    /** Reads every file under `dir` with bounded parallelism and returns plain data (one bridge round trip via `$value()`). */
    async readAllTextFiles(dir: ProjectDirectory = this.root, concurrency = 16): Promise<FileDump[]> {
        const files = this.recursiveGetAllFiles(dir);
        const out: FileDump[] = new Array(files.length);

        let next = 0;
        const lane = async () => {
            while (next < files.length) {
                const i = next++;
                const file = files[i];
                out[i] = {path: this.getPath(file).toString(), content: await (await this.readBlob(file.getId())).text()};
            }
        };

        await Promise.all(Array.from({length: Math.min(concurrency, files.length)}, () => lane()));
        return out;
    }

    /** Pushes into a shared array instead of `files.push(...recursiveResult)`, which copies per level and can blow the stack. */
    private collectFiles(dir: ProjectDirectory, out: ProjectFile[]): void {
        for (const child of this.getChildren(dir)) {
            if (child instanceof ProjectFile) {
                out.push(child);
            } else if (child instanceof ProjectDirectory) {
                this.collectFiles(child, out);
            }
        }
    }

    /** Drops a leading project-name segment (so "proj/a.txt" and "a.txt" mean the same thing). */
    private normalize(path: RelativePathInput): RelativePath {
        const segments = RelativePath.of(path).getSegments();
        return RelativePath.of(segments[0] === this.name ? segments.slice(1) : segments);
    }

    private resolveVNode(path: RelativePathInput): VNode | null {
        const rp = this.normalize(path);
        if (rp.isEmpty()) return this.rootVNode;
        return this.vNodeStore.resolvePath(rp.toString(), this.rootVNode.id) ?? null;
    }

    /** Replaces the blob's content in one writable (nothing is visible until `close()`), then records size + mtime. */
    private async writeBlob(id: string, content: BinaryContent): Promise<void> {
        const writable = await this.withBlobHandle(id, true, handle => handle.createWritable());
        try {
            await writable.write(content);
            await writable.close();
        } catch (e) {
            await writable.abort().catch(() => {
            });
            throw e;
        }

        const size = content instanceof Blob ? content.size : content.byteLength;
        this.vNodeStore.updateFile(id, size, Date.now());
    }

    private assertFileExists(file: ProjectFile | ProjectBinaryFile): void {
        if (!this.isLive(file.getId())) {
            throw new Error(`File ${file.getId()} does not exist in the VFS.`);
        }
    }

    /**
     * Reads the stored content of a file.
     * <p>
     * A file whose metadata records no content may have no blob yet (it was created and never saved), and reads as
     * empty. A file recording some content must have it stored.
     *
     * @throws FileContentLostError when the metadata records some content, but the blob is missing or empty
     */
    private async readBlob(id: string): Promise<File> {
        const expectedSize = (this.vNodeStore.getById(id) as VContentNode).size;

        let file: File;
        try {
            file = await this.withBlobHandle(id, false, handle => handle.getFile());
        } catch (e) {
            if (!ProjectVFS.isNotFound(e)) throw e;
            if (expectedSize > 0) throw this.contentLost(id, expectedSize);

            file = await this.withBlobHandle(id, true, handle => handle.getFile());
        }

        if (file.size === 0 && expectedSize > 0) throw this.contentLost(id, expectedSize);
        return file;
    }

    /**
     * Runs `operation` on the blob handle of a file. If it fails because the blob was removed after its handle was
     * cached, the handle is looked up again and `operation` retried once.
     *
     * @param create whether a missing blob is created (writes) or reported by a NotFoundError (reads)
     */
    private async withBlobHandle<T>(id: string, create: boolean, operation: (handle: FileSystemFileHandle) => Promise<T>): Promise<T> {
        const cached = this.blobHandles.get(id);
        if (cached) {
            try {
                return await operation(await cached);
            } catch (e) {
                if (!ProjectVFS.isNotFound(e)) throw e;
                if (this.blobHandles.get(id) === cached) this.blobHandles.delete(id);
            }
        }
        return operation(await this.lookupBlobHandle(id, create));
    }

    private lookupBlobHandle(id: string, create: boolean): Promise<FileSystemFileHandle> {
        const handle = this.blobsHandle.getFileHandle(id, {create});
        this.blobHandles.set(id, handle);
        handle.catch(() => {
            if (this.blobHandles.get(id) === handle) this.blobHandles.delete(id); // don't cache failures
        });
        return handle;
    }

    private contentLost(id: string, expectedSize: number): FileContentLostError {
        const error = new FileContentLostError(id, this.vNodeStore.getPath(id), expectedSize);
        ProjectVFS.logger.error(error.message);
        return error;
    }

    private static isNotFound(e: unknown): boolean {
        return e instanceof DOMException && e.name === "NotFoundError";
    }

    /** The store soft-deletes, so getById still returns deleted nodes. */
    private isLive(id: string): boolean {
        const node = this.vNodeStore.getById(id);
        return node != null && node.deletedAt === null;
    }
}