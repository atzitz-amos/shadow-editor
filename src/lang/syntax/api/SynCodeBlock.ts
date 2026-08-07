import {SynASTElementImpl} from "../impl/tree/SynASTElementImpl";
import {ASTNode} from "../builder/parser/nodes/ASTNode";
import {SynScope} from "./scope/SynScope";

/**
 *
 * @author Atzitz Amos
 * @date 11/23/2025
 * @since 1.0.0
 */
export abstract class SynCodeBlock extends SynASTElementImpl {
    protected constructor(node: ASTNode) {
        super(node);
    }

    getParentScope(): SynScope {
        return this.scope.getParent();
    }

    getAssociatedScope(): SynScope {
        return this.scope;
    }

    setSynthetic() {
        super.setSynthetic();
        this.getParent()?.setSynthetic();
    }
}
