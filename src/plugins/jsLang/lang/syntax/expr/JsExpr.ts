import {SynASTElementImpl} from "../../../../../core/lang/syntax/impl/tree/SynASTElementImpl";
import {SynNodeVisitor} from "../../../../../core/lang/syntax/utils/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";
import {ASTNode} from "../../../../../core/lang/syntax/builder/parser/nodes/ASTNode";

/**
 *
 * @author Atzitz Amos
 * @date 6/3/2026
 * @since 1.0.0
 */
export class JsExpr extends SynASTElementImpl {
    public constructor(node: ASTNode) {
        super(node);
    }

    public toDebugString(): string {
        return "[expr]";
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitExpr(this);
        }

        super.accept(visitor);
    }
}
