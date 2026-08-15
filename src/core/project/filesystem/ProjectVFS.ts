import {FileSystem} from "./FileSystem";
import {RelativePath, RelativePathInput} from "./path/RelativePath";
import {FileSystemEntry} from "./tree/FileSystemEntry";
import {ProjectDirectory} from "./tree/ProjectDirectory";
import {ProjectFile} from "./tree/ProjectFile";
import {GlobalState} from "../../global/GlobalState";
import {EventBus} from "../../events/EventBus";
import {VNode} from "./metadata/VNode";
import {VNodeStore} from "./metadata/VNodeStore";
import {DirectoryCreatedEvent} from "../events/DirectoryCreatedEvent";
import {FileCreatedEvent} from "../events/FileCreatedEvent";
import {UUIDHelper} from "../../../editor/utils/UUIDHelper";
import {EntryRenamedEvent} from "../events/EntryRenamedEvent";
import {EntryDeletedEvent} from "../events/EntryDeletedEvent";

/**
 *
 * @author Atzitz Amos
 * @date 8/10/2026
 * @since 1.0.0
 */
export class ProjectVFS implements FileSystem {
    private readonly name: string;

    private readonly vNodeStore: VNodeStore;
    private readonly virtualHandle: FileSystemDirectoryHandle;
    private blobsHandle: FileSystemDirectoryHandle;

    private readonly eventBus: EventBus;

    private root: ProjectDirectory;
    private rootVNode: VNode;

    private readonly childrenCache: Map<string, FileSystemEntry> = new Map<string, FileSystemEntry>();

    constructor(name: string, virtualHandle: FileSystemDirectoryHandle) {
        this.vNodeStore = VNodeStore.getInstance();
        this.virtualHandle = virtualHandle;

        this.eventBus = GlobalState.getMainEventBus();

        this.name = name;
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
        if (!(arg instanceof ProjectDirectory)) {
            arg = this.getDir(arg);
        }
        const id = UUIDHelper.newUUID();
        const vNode = this.vNodeStore.createDir(id, name, arg.getId(), Date.now(), Date.now(), null);
        const child = new ProjectDirectory(this, vNode);
        this.childrenCache.set(id, child);

        this.eventBus.syncPublish(new DirectoryCreatedEvent(child));
        return child;
    }

    createFile(parent: ProjectDirectory, name: string): ProjectFile;
    createFile(path: RelativePathInput, name: string): ProjectFile;
    createFile(arg: ProjectDirectory | RelativePathInput, name: string): ProjectFile {
        if (!(arg instanceof ProjectDirectory)) {
            arg = this.getDir(arg);
        }
        const id = UUIDHelper.newUUID();
        const vNode = this.vNodeStore.createFile(id,
            name,
            arg.getId(),
            Date.now(),
            Date.now(),
            null,
            0,
            "text/plain");
        const child = new ProjectFile(this, vNode);
        this.childrenCache.set(id, child);

        this.eventBus.syncPublish(new FileCreatedEvent(child));

        return child;
    }

    getEntry(path: RelativePathInput): FileSystemEntry {
        const rp = RelativePath.of(path);
        if (rp.isEmpty()) {
            return this.getRoot();
        } else if (rp.getSegments()[0] === this.name) {
            // Special case for root: if the first segment matches the project name, skip it.
            return this.getEntry(RelativePath.of(rp.getSegments().slice(1)));
        }

        const vNode = this.vNodeStore.resolvePath(path.toString(), this.rootVNode.id);
        if (!vNode) throw new Error("No entry at path: " + rp.toString());

        return this.getEntryForVNode(vNode);
    }

    getEntryForVNode(vNode: VNode): FileSystemEntry {
        if (this.childrenCache.has(vNode.id)) return this.childrenCache.get(vNode.id)!;

        if (vNode.kind === "file") {
            return new ProjectFile(this, vNode);
        } else {
            return new ProjectDirectory(this, vNode)
        }
    }

    getEntryById(id: string) {
        const byId = this.vNodeStore.getById(id);
        if (!byId) throw new Error("No entry with ID: " + id);
        return this.getEntryForVNode(byId);
    }

    getDir(path: RelativePathInput): ProjectDirectory {
        let node = this.getEntry(path);
        if (!(node instanceof ProjectDirectory)) {
            throw new Error(`Expected a directory at path ${path}, but found a file.`);
        }
        return node as ProjectDirectory;
    }

    getFile(path: RelativePathInput): ProjectFile {
        let node = this.getEntry(path);
        if (!(node instanceof ProjectFile)) {
            throw new Error(`Expected a file at path ${path}, but found a directory.`);
        }
        return node as ProjectFile;
    }

    exists(entry: FileSystemEntry): boolean;
    exists(path: RelativePathInput): boolean;
    exists(arg: FileSystemEntry | RelativePathInput): boolean {
        if (typeof arg === "string" || Array.isArray(arg) || arg instanceof RelativePath) {
            const rp = RelativePath.of(arg);
            if (rp.isEmpty()) return true;
            const vNode = this.vNodeStore.resolvePath(rp.toString(), this.rootVNode.id);
            return vNode !== null;
        }

        return this.vNodeStore.getById(arg.getId()) !== null;
    }

    isFile(entry: FileSystemEntry): boolean;
    isFile(path: RelativePathInput): boolean;
    isFile(arg: FileSystemEntry | RelativePathInput): boolean {
        if (typeof arg === "string" || Array.isArray(arg) || arg instanceof RelativePath) {
            const rp = RelativePath.of(arg);
            return this.vNodeStore.resolvePath(rp.toString(), this.rootVNode.id)?.kind === "file" || false;
        }
        return arg instanceof ProjectFile;
    }

    isDirectory(entry: FileSystemEntry): boolean;
    isDirectory(path: RelativePathInput): boolean;
    isDirectory(arg: FileSystemEntry | RelativePathInput): boolean {
        if (typeof arg === "string" || Array.isArray(arg) || arg instanceof RelativePath) {
            const rp = RelativePath.of(arg);
            return this.vNodeStore.resolvePath(rp.toString(), this.rootVNode.id)?.kind === "directory" || false;
        }
        return arg instanceof ProjectDirectory;
    }

    deleteEntry(entry: FileSystemEntry): void;
    deleteEntry(path: RelativePathInput): void;
    deleteEntry(arg: FileSystemEntry | RelativePathInput): void {
        if (typeof arg === "string" || Array.isArray(arg) || arg instanceof RelativePath) {
            arg = this.getEntry(arg);
        }

        const parent = arg.getParent();
        if (!parent) throw new Error("Cannot delete root directory");

        this.vNodeStore.delete(arg.getId());

        this.eventBus.syncPublish(new EntryDeletedEvent(arg));
    }

    renameEntry(entry: FileSystemEntry, newName: string): void;
    renameEntry(path: RelativePathInput, newName: string): void;
    renameEntry(arg: FileSystemEntry | RelativePathInput, newName: string): void {
        if (typeof arg === "string" || Array.isArray(arg) || arg instanceof RelativePath) {
            arg = this.getEntry(arg);
        }

        const parent = arg.getParent();
        const oldName = arg.getName();
        if (!parent) throw new Error("Cannot rename root directory");

        this.vNodeStore.rename(arg.getId(), newName);

        this.eventBus.syncPublish(new EntryRenamedEvent(arg, oldName, newName));
    }

    recursiveGetAllFiles(dir?: ProjectDirectory): ProjectFile[] {
        if (!dir) {
            dir = this.getRoot();
        }
        const files: ProjectFile[] = [];

        for (const child of this.getChildren(dir)) {
            if (child instanceof ProjectFile) {
                files.push(child);
            } else if (child instanceof ProjectDirectory) {
                files.push(...this.recursiveGetAllFiles(child));
            }
        }

        return files;
    }

    getChildren(parent: ProjectDirectory): FileSystemEntry[] {
        return this.vNodeStore.getChildren(parent.getId()).map(vNode => this.getEntryForVNode(vNode));
    }

    async getFileContent(file: ProjectFile): Promise<FileSystemFileHandle> {
        if (!this.vNodeStore.getById(file.getId())) throw new Error("File " + file.getPath().toString() + " does not exist in the VFS.");

        return await this.blobsHandle.getFileHandle(file.getId(), {create: true});
    }

    async write(file: ProjectFile, content: string): Promise<string> {
        if (!this.vNodeStore.getById(file.getId())) throw new Error("File " + file.getPath().toString() + " does not exist in the VFS.");

        const handle = await this.getFileContent(file);
        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();

        this.vNodeStore.updateFileSize(file.getId(), content.length);
        this.vNodeStore.updateModifiedAt(file.getId(), Date.now());

        return content;
    }

    getPath(entry: FileSystemEntry): RelativePath {
        return RelativePath.of(this.vNodeStore.getPath(entry.getId()));
    }
}
