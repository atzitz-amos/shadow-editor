import {ProjectDirectory} from "./ProjectDirectory";
import {RelativePath} from "../path/RelativePath";
import {ProjectFile} from "./ProjectFile";

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

    isFile(): this is ProjectFile;
}
