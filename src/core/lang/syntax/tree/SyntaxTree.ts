import {SynCodeBlock} from "../api/SynCodeBlock";
import {SynScope} from "../builder/parser/scopes/SynScope";
import {SynNodeVisitor} from "../visitors/SynNodeVisitor";
import {SynRecursiveVisitorImpl} from "../visitors/SynRecursiveVisitorImpl";

/**
 * Holds the base node of a SyntaxTree for a file and provides convenient access to its structure as well
 * as methods for traversing and querying the syntax elements within the tree.
 *
 * @author Atzitz Amos
 * @date 12/26/2025
 * @since 1.0.0
 */
export class SyntaxTree {
    private readonly root: SynCodeBlock;

    constructor(root: SynCodeBlock) {
        this.root = root;
    }

    public getRoot(): SynCodeBlock {
        return this.root;
    }

    public getRootScope(): SynScope {
        return this.root.getAssociatedScope();
    }

    public accept(visitor: SynNodeVisitor): void {
        new SynRecursiveVisitorImpl(visitor).visitNode(this.root);
    }
}
