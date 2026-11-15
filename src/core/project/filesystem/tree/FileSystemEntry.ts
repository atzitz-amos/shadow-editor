import {ProjectDirectory} from "./ProjectDirectory";
import {RelativePath} from "../path/RelativePath";
import {ProjectFile} from "./ProjectFile";
import {ProjectBinaryFile} from "./ProjectBinaryFile";

/**
 *
 * @author Atzitz Amos
 * @date 3/17/2026
 * @since 1.0.0
 */
export interface FileSystemEntry {
    getId(): string;

    getParent(): ProjectDirectory | null;

    getName(): string;

    getPath(): RelativePath;

    isDirectory(): this is ProjectDirectory;

    /** Text files only. Binary files answer `false` here; see {@link isBinaryFile}. */
    isFile(): this is ProjectFile;

    isBinaryFile(): this is ProjectBinaryFile;

    delete(): void;

    rename(name: string): void;
}
