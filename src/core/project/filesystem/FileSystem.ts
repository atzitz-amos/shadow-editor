import {ProjectDirectory} from "./tree/ProjectDirectory";
import {RelativePath, RelativePathInput} from "./path/RelativePath";
import {ProjectFile} from "./tree/ProjectFile";
import {FileSystemEntry} from "./tree/FileSystemEntry";

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

    getEntry(path: RelativePathInput): FileSystemEntry;

    getDir(path: RelativePathInput): ProjectDirectory;

    getFile(path: RelativePathInput): ProjectFile;

    getPath(entry: FileSystemEntry): RelativePath;

    exists(entry: FileSystemEntry): boolean;

    exists(path: RelativePathInput): boolean;

    isFile(entry: FileSystemEntry): boolean;

    isFile(path: RelativePathInput): boolean;

    isDirectory(entry: FileSystemEntry): boolean;

    isDirectory(path: RelativePathInput): boolean;

    deleteEntry(entry: FileSystemEntry): void;

    deleteEntry(path: RelativePathInput): void;

    renameEntry(entry: FileSystemEntry, newName: string): void;

    renameEntry(path: RelativePathInput, newName: string): void;

    recursiveGetAllFiles(dir?: ProjectDirectory): ProjectFile[];

    getChildren(parent: ProjectDirectory): FileSystemEntry[];

    getFileContent(file: ProjectFile): Promise<FileSystemFileHandle>;

    write(file: ProjectFile, content: string): Promise<string>;

    getEntryById(id: string): FileSystemEntry;
}