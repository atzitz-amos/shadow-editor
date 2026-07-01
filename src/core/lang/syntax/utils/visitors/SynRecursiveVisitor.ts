import {SynNodeVisitor} from "./SynNodeVisitor";
import {SynNode} from "../../api/SynNode";

/**
 *
 * @author Atzitz Amos
 * @date 6/1/2026
 * @since 1.0.0
 */
export class SynRecursiveVisitor extends SynNodeVisitor {
    public constructor(private visitor: SynNodeVisitor) {
        super();
    }

    isRecursive(): boolean {
        return true;
    }

    visitNode(node: SynNode) {
        node.accept(this.visitor);

        for (const child of node.getChildren()) {
            this.visitNode(child);
        }
    }
}
