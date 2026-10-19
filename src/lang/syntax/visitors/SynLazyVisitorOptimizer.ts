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
    private visitors: Map<number, SynNodeVisitor[]>;

    public constructor(visitors: Map<number, SynNodeVisitor[]> | SynNodeVisitor[]) {
        if (Array.isArray(visitors)) {
            this.visitors = new Map<number, SynNodeVisitor[]>();
            this.visitors.set(0, visitors);
        } else {
            this.visitors = visitors;
        }
    }

    public visitNode(node: SynNode) {
        for (const [_, visitors] of this.visitors.entries().toArray().toSorted((a, b) => a[0] - b[0])) {
            this.visitWithVisitors(node, visitors);
        }
    }

    public visitWithVisitors(node: SynNode, visitors: SynNodeVisitor[]) {
        for (const visitor of visitors) {
            try {
                node.accept(visitor);
            } catch (e) {
                console.warn(`Visitor ${visitor.constructor.name} threw an error while visiting node ${node.constructor.name}: ${e}`);
            }
        }

        for (const child of node.getChildren()) {
            this.visitWithVisitors(child, visitors);
        }

        for (const visitor of visitors) {
            try {
                visitor.visitExitNode(node);
            } catch (e) {
                console.warn(`Visitor ${visitor.constructor.name} threw an error while exiting node ${node.constructor.name}: ${e}`);
            }
        }
    }
}
