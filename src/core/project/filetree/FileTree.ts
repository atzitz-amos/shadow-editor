import {Directory} from "./Directory";
import {RelativePath} from "../path/RelativePath";
import {FileTreeEntry} from "./FileTreeEntry";
import {FileSystem} from "../filesystem/FileSystem";

/**
 * Represents the file tree structure of a project.
 *
 * @author Atzitz Amos
 * @date 11/14/2025
 * @since 1.0.0
 */
export class FileTree {
    private readonly root: Directory;

    constructor(filesystem: FileSystem, name: string, isVirtual: boolean) {
        this.root = new Directory(filesystem, name, new RelativePath(".", isVirtual, false));
    }

    public getRoot(): Directory {
        return this.root;
    }

    public atPath(path: RelativePath, createIfNotExists: boolean = false): FileTreeEntry {
        let current: Directory = this.root;
        for (const segment of path.getSegments().slice(0, -1)) {
            if (current.hasDirectory(segment)) {
                current = current.openDirectory(segment);
            } else if (createIfNotExists) {
                current = current.createDirectory(segment);
            } else {
                throw new Error(`Directory ${segment} does not exist in path ${path.getAsString()}.`);
            }
        }

        const lastSegment = path.getSegments().slice(-1)[0];
        if (!lastSegment)
            return this.root;
        if (current.hasDirectory(lastSegment)) {
            return current.openDirectory(lastSegment);
        }
        if (current.hasFile(lastSegment)) {
            return current.openFile(lastSegment);
        }
        throw new Error(`Entry ${lastSegment} does not exist in path ${path.getAsString()}.`);
    }

    public delete(path: RelativePath): void {
        let entry = this.atPath(path);
        entry.getParent().removeEntry(entry);
    }

    public exists(path: RelativePath, kind?: 'dir' | 'file'): boolean {
        let current: Directory = this.root;
        for (const segment of path.getSegments().slice(0, -1)) {
            if (current.hasDirectory(segment)) {
                current = current.openDirectory(segment);
            } else {
                return false;
            }
        }
        let lastSegment = path.getSegments().slice(-1)[0];
        if (!lastSegment)
            return true;
        if (current.hasDirectory(lastSegment) && (!kind || kind === "dir")) {
            return true;
        } else if (current.hasFile(lastSegment) && (!kind || kind === "file")) {
            return true;
        }
        return false;
    }

    public fileExists(path: RelativePath): boolean {
        return this.exists(path, 'file');
    }

    public directoryExists(path: RelativePath): boolean {
        return this.exists(path, 'dir');
    }
}
