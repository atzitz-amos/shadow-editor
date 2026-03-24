import {NodeEntry} from "./NodeEntry";
import {WorkspaceDirectory} from "./WorkspaceDirectory";
import {WorkspaceFS} from "../WorkspaceFS";
import {RelativePath} from "../path/RelativePath";

/**
 *
 * @author Atzitz Amos
 * @date 3/17/2026
 * @since 1.0.0
 */
export class WorkspaceFile implements NodeEntry {

    public constructor(private fs: WorkspaceFS, private name: string, private parent: WorkspaceDirectory, private handle: FileSystemFileHandle) {
    }

    getName(): string {
        return this.name;
    }

    getHandle(): FileSystemFileHandle {
        return this.handle;
    }

    getParent(): WorkspaceDirectory {
        return this.parent;
    }

    getPath(): RelativePath {
        return this.parent.getPath().join(this.name);
    }

    async getTextContent(): Promise<string> {
        return await this.handle.getFile().then(file => file.text());
    }
}
