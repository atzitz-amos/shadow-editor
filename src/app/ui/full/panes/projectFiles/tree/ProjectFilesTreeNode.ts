import {FSNodeEntry} from "../../../../../../core/workspace/filesystem/tree/FSNodeEntry";

/**
 *
 * @author Atzitz Amos
 * @date 6/27/2026
 * @since 1.0.0
 */
export interface ProjectFilesTreeNode {
    getEntry(): FSNodeEntry;

    getDepth(): number;
}
