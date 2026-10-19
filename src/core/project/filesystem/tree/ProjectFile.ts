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

    /** `lastModified:size` of the on-disk file the cache was read from. */
    private cacheStamp: string | null = null;

    public constructor(private readonly fs: FileSystem, private readonly vNode: VFileNode) {
    }

    delete(): void {
        this.fs.deleteEntry(this);
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

    /**
     * Always reflects what is on disk, but only pays for reading + decoding the text when the file actually changed.
     * (`getFile()` is a cheap snapshot; `text()` is the expensive part.)
     */
    async getTextContent(): Promise<string> {
        const handle = await this.fs.getFileContent(this);
        const file = await handle.getFile();

        const stamp = `${file.lastModified}:${file.size}`;
        if (this.cachedContent === null || this.cacheStamp !== stamp) {
            this.cachedContent = await file.text();
            this.cacheStamp = stamp;
        }
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
        this.cacheStamp = null; // disk stamp changed; the next read re-validates (and re-reads once)
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