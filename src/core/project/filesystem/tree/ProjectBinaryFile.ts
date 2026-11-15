import {FileSystemEntry} from "./FileSystemEntry";
import {ProjectDirectory} from "./ProjectDirectory";
import {ProjectFile} from "./ProjectFile";
import {RelativePath} from "../path/RelativePath";
import {FileSystem} from "../FileSystem";
import {FileMetadata} from "../metadata/NodeMetadata";
import {VBinaryNode} from "../metadata/VNode";

/** What a binary file can be written from. `Blob`s (and `File`s) are streamed to disk without being copied into memory. */
export type BinaryContent = BufferSource | Blob;

/**
 * A file that only ever holds raw bytes. It is deliberately NOT a {@link ProjectFile}: everything that walks
 * text files (search, the editor, the save pipeline) is typed on `ProjectFile`, so binaries stay out of it by construction.
 *
 * Content is not cached: {@link getBlob} is already a cheap, lazy snapshot of the on-disk file, and decoding is the
 * caller's business.
 *
 * @author Atzitz Amos
 * @date 11/11/2026
 * @since 1.0.0
 */
export class ProjectBinaryFile implements FileSystemEntry {
    public constructor(private readonly fs: FileSystem, private readonly vNode: VBinaryNode) {
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

    getSize(): number {
        return this.vNode.size;
    }

    getMimetype(): string {
        return this.vNode.mimeType;
    }

    isDeleted(): boolean {
        return this.getDeletedAt() !== null;
    }

    /** Lazy handle on the current on-disk content; nothing is read until you call `arrayBuffer()`/`stream()`/`slice()` on it. */
    async getBlob(): Promise<File> {
        return this.fs.readBinary(this);
    }

    /** Reads the whole file into memory. Prefer {@link getBlob} for large files or partial reads. */
    async getBytes(): Promise<Uint8Array> {
        return new Uint8Array(await (await this.getBlob()).arrayBuffer());
    }

    async save(content: BinaryContent): Promise<void> {
        await this.fs.writeBinary(this, content);
    }

    isDirectory(): this is ProjectDirectory {
        return false;
    }

    isFile(): this is ProjectFile {
        return false;
    }

    isBinaryFile(): this is ProjectBinaryFile {
        return true;
    }
}
