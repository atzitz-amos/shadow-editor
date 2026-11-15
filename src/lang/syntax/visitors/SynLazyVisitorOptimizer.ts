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

    /**
     * @param visitors the visitors to run, grouped by priority (lowest first)
     * @param onError called when a visitor throws, the traversal continues with the other visitors
     */
    public constructor(visitors: Map<number, SynNodeVisitor[]> | SynNodeVisitor[],
                       private readonly onError: VisitorErrorHandler = SynLazyVisitorOptimizer.warnOnError) {
        if (Array.isArray(visitors)) {
            this.visitors = new Map<number, SynNodeVisitor[]>();
            this.visitors.set(0, visitors);
        } else {
            this.visitors = visitors;
        }
    }

    private static warnOnError(visitor: SynNodeVisitor, node: SynNode, error: unknown, whileExiting: boolean) {
        console.warn(`Visitor ${visitor.constructor.name} threw an error while ${whileExiting ? "exiting" : "visiting"} node ${node.constructor.name}: ${error}`);
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
                this.onError(visitor, node, e, false);
            }
        }

        for (const child of node.getChildren()) {
            this.visitWithVisitors(child, visitors);
        }

        for (const visitor of visitors) {
            try {
                visitor.visitExitNode(node);
            } catch (e) {
                this.onError(visitor, node, e, true);
            }
        }
    }
}

export type VisitorErrorHandler = (visitor: SynNodeVisitor, node: SynNode, error: unknown, whileExiting: boolean) => void;
