import {Path} from "../path/Path";
import {Directory} from "./Directory";

/**
 *
 * @author Atzitz Amos
 * @date 11/14/2025
 * @since 1.0.0
 */
export interface FileTreeEntry {
    getName(): string;

    getParent(): Directory;

    setParent(parent: Directory): void;

    getPath(): Path;

    setHandle(handle: FileSystemHandle | null): void;

    getHandle(): FileSystemHandle | null;
}
