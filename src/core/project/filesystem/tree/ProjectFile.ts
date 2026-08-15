import {FileSystemEntry} from "./FileSystemEntry";
import {ProjectDirectory} from "./ProjectDirectory";
import {RelativePath} from "../path/RelativePath";
import {EditorURI} from "../../../uri/EditorURI";
import {URITargetType} from "../../../uri/URITargetType";
import {FileSystem} from "../FileSystem";
import {FileMetadata} from "../metadata/NodeMetadata";
import {VFileNode} from "../metadata/VNode";

/**
 *
 * @author Atzitz Amos
 * @date 3/17/2026
 * @since 1.0.0
 */
export class ProjectFile implements FileSystemEntry {
    private cachedContent: string | null = null;

    public constructor(private readonly fs: FileSystem, private readonly vNode: VFileNode) {
    }

    getId(): string {
        return this.vNode.id;
    }

    getName(): string {
        return this.vNode.name;
    }

    getMetadata(): FileMetadata {
        return this.vNode;
    }

    rename(name: string): void {
        this.fs.renameEntry(this, name);
    }

    getParent(): ProjectDirectory {
        return this.fs.getEntryById(this.vNode.parentId!) as ProjectDirectory;
    }

    getPath(): RelativePath {
        return this.fs.getPath(this);
    }

    getExtension(): string {
        const name = this.getName();

        const dotIndex = name.lastIndexOf(".");
        if (dotIndex === -1) return "";
        return name.substring(dotIndex + 1);
    }

    getCreatedAt(): number {
        return this.vNode.createdAt;
    }

    getModifiedAt(): number {
        return this.vNode.modifiedAt;
    }

    getDeletedAt(): number | null {
        return this.vNode.deletedAt;
    }

    getSize() {
        return this.vNode.size;
    }

    getMimetype(): string {
        return this.vNode.mimeType;
    }

    isDeleted(): boolean {
        return this.getDeletedAt() !== null;
    }

    async getTextContent(): Promise<string> {
        const handle = await this.fs.getFileContent(this);
        const file = await handle.getFile();
        this.cachedContent = await file.text();
        return this.cachedContent;
    }

    getCachedContent(): string | null {
        return this.cachedContent;
    }

    async ensureCacheUpToDate(): Promise<void> {
        await this.getTextContent();
    }

    async save(content: string): Promise<void> {
        this.cachedContent = await this.fs.write(this, content);
    }

    getURI(): EditorURI {
        return new EditorURI(this.getPath().toString(), URITargetType.FILE);
    }

    isDirectory(): this is ProjectDirectory {
        return false;
    }

    isFile(): this is ProjectFile {
        return true;
    }
}
