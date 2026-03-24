import {WorkspaceDirectory} from "./WorkspaceDirectory";

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

    getPath(): void;
}
