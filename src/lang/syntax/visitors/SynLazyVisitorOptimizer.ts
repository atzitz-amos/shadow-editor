import {SynNodeVisitor} from "./SynNodeVisitor";
import {SynNode} from "../api/SynNode";

/**
 * Lazy implementation of the visitor pattern, that wraps multiple visitors into one for performance reasons.
 *
 * @author Atzitz Amos
 * @date 6/1/2026
 * @since 1.0.0
 */
export class SynLazyVisitorOptimizer {
    public constructor(private visitors: SynNodeVisitor[]) {
    }

    public visitNode(node: SynNode) {
        for (const visitor of this.visitors) {
            try {
                node.accept(visitor);
            } catch (e) {
                console.warn(`Visitor ${visitor.constructor.name} threw an error while visiting node ${node.constructor.name}: ${e}`);
            }
        }

        for (const child of node.getChildren()) {
            this.visitNode(child);
        }

        for (const visitor of this.visitors) {
            if ("visitExitNode" in visitor && typeof visitor.visitExitNode === "function") {
                try {
                    visitor.visitExitNode(node);
                } catch (e) {
                    console.warn(`Visitor ${visitor.constructor.name} threw an error while exiting node ${node.constructor.name}: ${e}`);
                }
            }
        }
    }
}
