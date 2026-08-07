import {SynNodeVisitor} from "./SynNodeVisitor";

/**
 *
 * @author Atzitz Amos
 * @date 6/1/2026
 * @since 1.0.0
 */
export class SynRecursiveVisitor extends SynNodeVisitor {
    isRecursive(): boolean {
        return true;
    }
}
