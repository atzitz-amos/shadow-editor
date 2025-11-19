import {FileTreeEntry} from "./FileTreeEntry";
import {ProjectFile} from "./ProjectFile";
import {Path} from "../path/Path";
import {FileSystem} from "../filesystem/FileSystem";

/**
 * Directory representation in the file tree.
 *
 * @author Atzitz Amos
 * @date 11/14/2025
 * @since 1.0.0
 */
export class Directory implements FileTreeEntry {
    private readonly name: string;
    private parent: Directory | null = null;
    private contents: FileTreeEntry[] = [];

    private handle: FileSystemDirectoryHandle | null = null;

    constructor(private filesystem: FileSystem, name: string, private path: Path) {
        this.name = name;
    }

    public setHandle(handle: FileSystemDirectoryHandle | null): void {
        this.handle = handle;
    }

    public getHandle(): FileSystemDirectoryHandle | null {
        return this.handle;
    }

    public getName(): string {
        return this.name;
    }

    public setParent(parent: Directory | null) {
        this.parent = parent;
    }

    public getParent(): Directory {
        if (!this.parent)
            throw new Error(`Root directory has no parent.`);
        return this.parent;
    }

    public getPath(): Path {
        return this.path;
    }

    public getContents(): FileTreeEntry[] {
        return this.contents;
    }

    public hasDirectory(segment: string) {
        return this.contents.some(e => (e instanceof Directory && e.getName() === segment));
    }

    public hasFile(segment: string) {
        return this.contents.some(e => ((e instanceof ProjectFile) && e.getName() === segment));
    }

    public addEntry(entry: FileTreeEntry): FileTreeEntry {
        this.contents.push(entry);
        entry.setParent(this);
        return entry;
    }

    public removeEntry(entry: FileTreeEntry): void {
        for (let i = 0; i < this.contents.length; i++) {
            if (this.contents[i] === entry) {
                this.contents.splice(i, 1);
                return;
            }
        }
    }

    public createDirectory(name: string) {
        const dir = new Directory(this.filesystem,name, this.path.extendDir(name));
        this.addEntry(dir);
        return dir;
    }

    public removeSelf(): void {
        if (!this.parent)
            throw new Error(`Cannot remove root directory.`);
        this.parent.removeEntry(this);
    }

    public openDirectory(name: string): Directory {
        const dir = this.contents.find(e => (e instanceof Directory && e.getName() === name));
        if (!dir || !(dir instanceof Directory)) {
            throw new Error(`Directory ${name} does not exist.`);
        }
        return dir;
    }

    public openFile(filename: string) {
        const file = this.contents.find(e => (e instanceof ProjectFile && e.getName() === filename));
        if (!file || !(file instanceof ProjectFile)) {
            throw new Error(`File ${filename} does not exist.`);
        }
        return file;
    }

    public resolve(name: string): FileTreeEntry {
        const entry = this.contents.find(e => e.getName() === name);
        if (!entry) {
            throw new Error(`Entry ${name} does not exist.`);
        }
        return entry;
    }
}
