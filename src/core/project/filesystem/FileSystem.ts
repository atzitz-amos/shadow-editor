import {Directory} from "../filetree/Directory";
import {FileTreeEntry} from "../filetree/FileTreeEntry";
import {ProjectFile} from "../filetree/ProjectFile";

/**
 *
 * @author Atzitz Amos
 * @date 11/14/2025
 * @since 1.0.0
 */
export interface FileSystem {
    getRootDirectory(): Directory;

    getDirectory(path: string): Directory;

    getFile(path: string): ProjectFile;

    readFile(path: string): string;

    writeFile(file: ProjectFile, content: string): void;

    createFile(parent: Directory | null, name: string, content: string): ProjectFile;

    deleteFile(file: ProjectFile): void;

    fileExists(path: string): boolean;

    createDirectory(parent: Directory | null, name: string): Directory;

    directoryExists(path: string): boolean;

    deleteDirectory(dir: Directory): void;

    getDirectoryContents(path: string): FileTreeEntry[];
}
