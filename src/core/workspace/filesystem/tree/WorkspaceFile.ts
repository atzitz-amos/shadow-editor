import {FSNodeEntry} from "./FSNodeEntry";
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
export class WorkspaceFile implements FSNodeEntry {
    private cachedContent: string | null = null;
    private cachedTimestamp: number | null = null;

    public constructor(private fs: WorkspaceFS, private name: string, private parent: WorkspaceDirectory, private handle: FileSystemFileHandle) {
    }

    getName(): string {
        return this.name;
    }

    async rename(name: string): Promise<WorkspaceFile> {
        return await this.fs.renameEntry(this, name) as WorkspaceFile;
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

    async getLastModified(): Promise<number> {
        return (await this.handle.getFile()).lastModified;
    }

    async getTextContent(): Promise<string> {
        const file = await this.handle.getFile();
        this.cachedContent = await file.text();
        this.cachedTimestamp = file.lastModified;
        return this.cachedContent;
    }

    async getLength() {
        return (await this.getTextContent()).length;
    }

    getCachedContent(): string | null {
        return this.cachedContent;
    }

    getCachedTimestamp(): number | null {
        return this.cachedTimestamp;
    }

    getCachedLength(): number | null {
        return this.cachedContent !== null ? this.cachedContent.length : null;
    }

    async ensureCacheUpToDate(): Promise<void> {
        await this.getTextContent();
    }

    async save(content: string): Promise<boolean> {
        try {
            const writable = await this.handle.createWritable();
            await writable.write(content);
            await writable.close();
        } catch (e) {
            console.error("Failed to save file:", e);
            return false;
        }

        const file = await this.handle.getFile();
        this.cachedTimestamp = file.lastModified;
        this.cachedContent = await file.text();
        if (content !== this.cachedContent) {
            console.error("File content wasn't saved correctly. Expected:",
                content.length,
                "bytes but got:",
                this.cachedContent.length, "bytes");
            return false;
        }
        return true;
    }

    getURI(): EditorURI {
        return new EditorURI(this.getPath().toString(), URITargetType.FILE);
    }

    isDirectory(): this is WorkspaceDirectory {
        return false;
    }

    isFile(): this is WorkspaceFile {
        return true;
    }
}
