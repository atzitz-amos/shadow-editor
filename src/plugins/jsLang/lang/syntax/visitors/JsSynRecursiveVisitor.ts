import {JsSynVisitor} from "./JsSynVisitor";

/**
 *
 * @author Atzitz Amos
 * @date 6/29/2026
 * @since 1.0.0
 */
export class JsSynRecursiveVisitor extends JsSynVisitor {
    isRecursive(): boolean {
        return true;
    }
}
