import {FileSystemEntry} from "./FileSystemEntry";
import {RelativePath} from "../path/RelativePath";
import {ProjectFile} from "./ProjectFile";
import {FileSystem} from "../FileSystem";
import {DirectoryMetadata} from "../metadata/NodeMetadata";
import {VNode} from "../metadata/VNode";

/**
 *
 * @author Atzitz Amos
 * @date 3/17/2026
 * @since 1.0.0
 */
export class ProjectDirectory implements FileSystemEntry {
    public constructor(private fs: FileSystem, private readonly vNode: VNode) {

    }

    createDir(name: string): ProjectDirectory {
        return this.fs.createDir(this, name);
    }

    createFile(name: string) {
        return this.fs.createFile(this, name);
    }

    rename(name: string): void {
        this.fs.renameEntry(this, name);
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

    getChildren() {
        return this.fs.getChildren(this);
    }
}
