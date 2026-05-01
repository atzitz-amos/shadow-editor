import {WorkspaceDirectory} from "./WorkspaceDirectory";
import {RelativePath} from "../path/RelativePath";
import {WorkspaceFile} from "./WorkspaceFile";

/**
 *
 * @author Atzitz Amos
 * @date 3/17/2026
 * @since 1.0.0
 */
export interface NodeEntry {
    getHandle(): FileSystemHandle;

    getParent(): WorkspaceDirectory | null;

    getName(): string;

    getPath(): RelativePath;

    isDirectory(): this is WorkspaceDirectory;

    isFile(): this is WorkspaceFile;
}
