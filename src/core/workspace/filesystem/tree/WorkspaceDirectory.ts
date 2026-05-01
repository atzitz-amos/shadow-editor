import {NodeEntry} from "./NodeEntry";
import {WorkspaceFS} from "../WorkspaceFS";
import {RelativePath} from "../path/RelativePath";
import {WorkspaceFile} from "./WorkspaceFile";

/**
 *
 * @author Atzitz Amos
 * @date 3/17/2026
 * @since 1.0.0
 */
export class WorkspaceDirectory implements NodeEntry {
    public constructor(private fs: WorkspaceFS, private name: string, private parent: WorkspaceDirectory | null, private handle: FileSystemDirectoryHandle) {

    }

    async createDir(name: string): Promise<WorkspaceDirectory> {
        return await this.fs.createDir(this, name);
    }

    async createFile(name: string) {
        return await this.fs.createFile(this, name);
    }

    getName(): string {
        return this.name;
    }

    getPath(): RelativePath {
        if (this.parent === null) {
            return RelativePath.of(this.name);
        }
        return this.parent.getPath().join(this.name);
    }

    getHandle(): FileSystemDirectoryHandle {
        return this.handle;
    }

    getParent(): WorkspaceDirectory | null {
        return this.parent;
    }

    isDirectory(): this is WorkspaceDirectory {
        return true;
    }

    isFile(): this is WorkspaceFile {
        return false;
    }

    async getChildren() {
        return await this.fs.getChildren(this);
    }
}
