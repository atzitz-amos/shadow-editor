import {VirtualFile} from "./VirtualFile";
import {Path} from "../path/Path";
import {Project} from "../Project";
import {FileTreeEntry} from "./FileTreeEntry";
import {Directory} from "./Directory";

export class ProjectFile implements FileTreeEntry {
    private path: Path;

    private parent: Directory | null = null;
    private content: string = "";

    private handle: FileSystemFileHandle | null = null;

    constructor(private project: Project, private name: string, private rootPath: Path) {
        this.path = rootPath.extendFile(name);
    }

    setHandle(handle: FileSystemFileHandle | null): void {
        this.handle = handle;
    }

    getHandle(): FileSystemHandle | null {
        return this.handle;
    }

    getParent(): Directory {
        if (!this.parent)
            throw new Error(`File ${this.getName()} has no parent directory.`);
        return this.parent;
    }

    setParent(parent: Directory | null): void {
        this.parent = parent;
    }

    getProject(): Project {
        return this.project;
    }

    getVirtualFile(): VirtualFile {
        return new VirtualFile(this);
    }

    getPath(): Path {
        return this.path;
    }

    getName() {
        return this.name;
    }

    getExtension() {
        return this.path.getExtension();
    }

    getContent(): string {
        return this.content;
    }

    notifyContentChange(content: string) {
        this.content = content;
    }
}