import {FileSystemEntry} from "./FileSystemEntry";
import {RelativePath, RelativePathInput} from "../path/RelativePath";
import {ProjectFile} from "./ProjectFile";
import {FileSystem} from "../FileSystem";
import {DirectoryMetadata} from "../metadata/NodeMetadata";
import {VNode} from "../metadata/VNode";
import {ProjectBinaryFile} from "./ProjectBinaryFile";

/**
 *
 * @author Atzitz Amos
 * @date 3/17/2026
 * @since 1.0.0
 */
export class ProjectDirectory implements FileSystemEntry {

    public constructor(private fs: FileSystem, private readonly vNode: VNode) {

    }

    getFS(): FileSystem {
        return this.fs;
    }

    delete(): void {
        this.fs.deleteEntry(this);
    }

    createDir(name: string): ProjectDirectory {
        return this.fs.createDir(this, name);
    }

    createFile(name: string) {
        return this.fs.createFile(this, name);
    }

    createBinaryFile(name: string, mimeType?: string): ProjectBinaryFile {
        return this.fs.createBinaryFile(this, name, mimeType);
    }

    rename(name: string): void {
        this.fs.renameEntry(this, name);
    }

    openDirectory(path: RelativePathInput): ProjectDirectory {
        return this.fs.getDir(RelativePath.of(path).relativeTo(this.getPath()))
    }

    openFile(path: RelativePathInput): ProjectFile {
        return this.fs.getFile(RelativePath.of(path).relativeTo(this.getPath()))
    }

    hasDirectory(path: RelativePathInput): boolean {
        return this.fs.isDirectory(RelativePath.of(path).relativeTo(this.getPath()));
    }

    openBinaryFile(path: RelativePathInput): ProjectBinaryFile {
        return this.fs.getBinaryFile(RelativePath.of(path).relativeTo(this.getPath()))
    }

    hasFile(path: RelativePathInput): boolean {
        return this.fs.isFile(RelativePath.of(path).relativeTo(this.getPath()));
    }

    hasBinaryFile(path: RelativePathInput): boolean {
        return this.fs.isBinaryFile(RelativePath.of(path).relativeTo(this.getPath()));
    }

    getId(): string {
        return this.vNode.id;
    }

    getName(): string {
        return this.vNode.name;
    }

    getMetadata(): DirectoryMetadata {
        return this.vNode;
    }

    getPath(): RelativePath {
        return this.fs.getPath(this);
    }

    getParent(): ProjectDirectory | null {
        return this.vNode.parentId ? this.fs.getEntryById(this.vNode.parentId) as ProjectDirectory : null;
    }

    isDirectory(): this is ProjectDirectory {
        return true;
    }

    isFile(): this is ProjectFile {
        return false;
    }

    isBinaryFile(): this is ProjectBinaryFile {
        return false;
    }

    getChildren() {
        return this.fs.getChildren(this);
    }
}
