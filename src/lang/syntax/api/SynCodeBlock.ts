import {SynASTElementImpl} from "../impl/tree/SynASTElementImpl";
import {ASTNode} from "../builder/parser/nodes/ASTNode";
import {SynNodeVisitor} from "../visitors/SynNodeVisitor";
import {SynScopeType} from "../../indexes/scope/SynScopeType";
import {SynScope} from "../../indexes/scope/SynScope";

/**
 *
 * @author Atzitz Amos
 * @date 11/23/2025
 * @since 1.0.0
 */
export abstract class SynCodeBlock extends SynASTElementImpl {
    private associatedScope: SynScope | null = null;

    protected constructor(node: ASTNode) {
        super(node);
    }

    setSynthetic() {
        super.setSynthetic();
        this.getParent()?.setSynthetic();
    }

    accept(visitor: SynNodeVisitor) {
        visitor.visitCodeblock(this);
        super.accept(visitor);
    }

    getAssociatedScope(): SynScope | null {
        return this.associatedScope;
    }

    setAssociatedScope(scope: SynScope | null) {
        this.associatedScope = scope;
    }

    getAssociatedScopeType(): SynScopeType | null {
        return null;
    }
}
