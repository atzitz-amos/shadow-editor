import {ProjectDirectory} from "./tree/ProjectDirectory";
import {RelativePath, RelativePathInput} from "./path/RelativePath";
import {ProjectFile} from "./tree/ProjectFile";
import {FileSystemEntry} from "./tree/FileSystemEntry";
import {BinaryContent, ProjectBinaryFile} from "./tree/ProjectBinaryFile";

/**
 *
 * @author Atzitz Amos
 * @date 8/10/2026
 * @since 1.0.0
 */
export interface FileSystem {
    init(): Promise<void>;

    getRoot(): ProjectDirectory;

    createDir(parent: ProjectDirectory, name: string): ProjectDirectory;

    createDir(path: RelativePathInput, name: string): ProjectDirectory;

    createFile(parent: ProjectDirectory, name: string): ProjectFile;

    createFile(path: RelativePathInput, name: string): ProjectFile;

    /** Defaults to `application/octet-stream`. */
    createBinaryFile(parent: ProjectDirectory, name: string, mimeType?: string): ProjectBinaryFile;

    createBinaryFile(path: RelativePathInput, name: string, mimeType?: string): ProjectBinaryFile;

    getEntry(path: RelativePathInput): FileSystemEntry;

    getDir(path: RelativePathInput): ProjectDirectory;

    getFile(path: RelativePathInput): ProjectFile;

    getBinaryFile(path: RelativePathInput): ProjectBinaryFile;

    getPath(entry: FileSystemEntry): RelativePath;

    exists(entry: FileSystemEntry): boolean;

    exists(path: RelativePathInput): boolean;

    isFile(entry: FileSystemEntry): boolean;

    isFile(path: RelativePathInput): boolean;

    isBinaryFile(entry: FileSystemEntry): boolean;

    isBinaryFile(path: RelativePathInput): boolean;

    isDirectory(entry: FileSystemEntry): boolean;

    isDirectory(path: RelativePathInput): boolean;

    deleteEntry(entry: FileSystemEntry): void;

    deleteEntry(path: RelativePathInput): void;

    renameEntry(entry: FileSystemEntry, newName: string): void;

    renameEntry(path: RelativePathInput, newName: string): void;

    recursiveGetAllFiles(dir?: ProjectDirectory): ProjectFile[];

    getChildren(parent: ProjectDirectory): FileSystemEntry[];

    /**
     * A snapshot of the stored content of a file, read lazily.
     * @throws FileContentLostError when the metadata records some content but none is stored
     */
    getFileContent(file: ProjectFile): Promise<File>;

    write(file: ProjectFile, content: string): Promise<string>;

    /** @throws FileContentLostError when the metadata records some content but none is stored */
    readBinary(file: ProjectBinaryFile): Promise<File>;

    writeBinary(file: ProjectBinaryFile, content: BinaryContent): Promise<void>;

    getEntryById(id: string): FileSystemEntry;
}