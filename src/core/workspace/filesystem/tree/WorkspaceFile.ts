import {NodeEntry} from "./NodeEntry";
import {WorkspaceDirectory} from "./WorkspaceDirectory";
import {WorkspaceFS} from "../WorkspaceFS";
import {RelativePath} from "../path/RelativePath";
import {EditorURI} from "../../../uri/EditorURI";
import {URITargetType} from "../../../uri/URITargetType";

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

    getExtension(): string {
        const dotIndex = this.name.lastIndexOf(".");
        if (dotIndex === -1) return "";
        return this.name.substring(dotIndex + 1);
    }

    async getTextContent(): Promise<string> {
        return await this.handle.getFile().then(file => file.text());
    }

    async save(content: string) {
        const writable = await this.handle.createWritable();
        await writable.write(content);
        await writable.close();
    }

    getURI(): EditorURI {
        return new EditorURI(this.getPath().toString(), URITargetType.FILE);
    }

    getLength() {
        return 0; // TODO
    }

    isDirectory(): this is WorkspaceDirectory {
        return false;
    }

    isFile(): this is WorkspaceFile {
        return true;
    }
}
