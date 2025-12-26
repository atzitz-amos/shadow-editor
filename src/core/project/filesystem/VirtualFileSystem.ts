import {FileSystem} from "./FileSystem";
import {Project} from "../Project";
import {FileTree} from "../filetree/FileTree";
import {Directory} from "../filetree/Directory";
import {FileTreeEntry} from "../filetree/FileTreeEntry";
import {ProjectFile} from "../filetree/ProjectFile";
import {BulkRequest} from "./bulk/BulkRequest";
import {BulkWriteFileRequest} from "./bulk/BulkWriteFileRequest";
import {BulkDeleteFileRequest} from "./bulk/BulkDeleteFileRequest";
import {BulkCreateDirectoryRequest} from "./bulk/BulkCreateDirectoryRequest";
import {BulkDeleteDirectoryRequest} from "./bulk/BulkDeleteDirectoryRequest";
import {BulkCreateFileRequest} from "./bulk/BulkCreateFileRequest";
import {PersistenceStrategy} from "../../persistence/PersistenceStrategy";
import {GlobalProject} from "../../global/GlobalProject";
import {RelativePath} from "../path/RelativePath";
import {VirtualFile} from "../filetree/VirtualFile";

/**
 *
 * @author Atzitz Amos
 * @date 11/14/2025
 * @since 1.0.0
 */
export class VirtualFileSystem implements FileSystem {
    private static instance: VirtualFileSystem;

    private fileTree: FileTree;
    private root: FileSystemDirectoryHandle;

    private queue: BulkRequest[] = [];
    private flushed: boolean = false;

    constructor(private project: Project) {
        this.fileTree = new FileTree(this, project.getName(), true);
    }

    public static async load(project: Project, persistence: PersistenceStrategy) {
        if (this.instance)
            throw new Error("VirtualFileSystem instance already exists.");
        this.instance = new VirtualFileSystem(project);

        const rootHandle = await navigator.storage.getDirectory();
        const handle = await rootHandle.getDirectoryHandle(project.getName(), {create: true});

        if (persistence === PersistenceStrategy.PERSIST) {
            this.instance.setRoot(handle);
            await this.instance.recover();
        } else if (persistence === PersistenceStrategy.CLEAR) {
            for await (const entry of handle.keys()) {
                await handle.removeEntry(entry, {recursive: true});
            }
            this.instance.setRoot(handle);
        }

        return this.instance;
    }

    public static getInstance(): VirtualFileSystem {
        if (!this.instance)
            this.instance = new VirtualFileSystem(GlobalProject.getInstance()!);
        return this.instance;
    }

    getFile(path: string): ProjectFile {
        const file = this.fileTree.atPath(new RelativePath(path, true, true));
        if (!(file instanceof ProjectFile))
            throw new Error(`File at path ${path.toString()} does not exist.`);
        return file;
    }

    getDirectory(path: string): Directory {
        const dir = this.fileTree.atPath(new RelativePath(path, true, false));
        if (!(dir instanceof Directory))
            throw new Error(`Directory at path ${path.toString()} does not exist.`);
        return dir;
    }

    createFile(parent: Directory | null, name: string, content: string = ""): ProjectFile {
        if (!parent)
            parent = this.getRootDirectory();
        const file = new ProjectFile(this.project, name, parent.getPath().extendFile(name));

        this.schedule(new BulkCreateFileRequest(parent, file));
        this.schedule(new BulkWriteFileRequest(file, content));

        return file;
    }

    deleteFile(file: ProjectFile): void {
        this.schedule(new BulkDeleteFileRequest(file.getParent(), file));
    }

    fileExists(path: string): boolean {
        return this.fileTree.fileExists(new RelativePath(path, true, true));
    }

    createDirectory(parent: Directory | null, name: string): Directory {
        if (!parent)
            parent = this.getRootDirectory();
        const dir = new Directory(this, name, parent.getPath().extendDir(name));

        this.schedule(new BulkCreateDirectoryRequest(parent, dir));

        return dir;
    }

    directoryExists(path: string): boolean {
        return this.fileTree.directoryExists(new RelativePath(path, true, false));
    }

    deleteDirectory(dir: Directory): void {
        this.schedule(new BulkDeleteDirectoryRequest(dir.getParent(), dir));
    }

    getDirectoryContents(path: string): FileTreeEntry[] {
        return this.getDirectory(path).getContents();
    }

    readFile(path: string): string {
        return this.getFile(path).getContent();
    }

    writeFile(file: ProjectFile, content: string): void {
        this.schedule(new BulkWriteFileRequest(file, content));
    }

    getRootDirectory(): Directory {
        return this.fileTree.getRoot();
    }

    commitFile(file: VirtualFile) {
        this.writeFile(file.getFile(), file.getContent());
    }

    private setRoot(handle: FileSystemDirectoryHandle) {
        this.root = handle;
        this.fileTree.getRoot().setHandle(handle);
    }

    private async recover(current: Directory | null = null, root: FileSystemDirectoryHandle | null = null) {
        if (!this.root)
            throw new Error("Root handle is not set.");

        if (!current) current = this.fileTree.getRoot();
        if (!root) root = this.root;

        for await (const [name, handle] of root.entries()) {
            if (handle.kind === "file") {
                const fileHandle = handle as FileSystemFileHandle;
                const file = new ProjectFile(this.project, name, current.getPath().extendFile(name));
                file.setHandle(fileHandle);

                const fileData = await fileHandle.getFile();
                file.notifyContentChange(await fileData.text());

                current.addEntry(file);
            } else {
                const dirHandle = handle as FileSystemDirectoryHandle;
                const dir = new Directory(this, name, current.getPath().extendDir(name));
                dir.setHandle(dirHandle);

                current.addEntry(dir);
                await this.recover(dir, dirHandle);
            }
        }
    }

    private schedule(request: BulkRequest) {
        this.queue.push(request);
        if (!this.flushed) {
            this.flushed = true;
            this.flushQueue();
        }
    }

    private async flushQueue() {
        const requests = this.queue;
        this.queue = [];

        for (const req of requests) {
            await req.fulfill();
        }

        this.flushed = false;
    }
}

