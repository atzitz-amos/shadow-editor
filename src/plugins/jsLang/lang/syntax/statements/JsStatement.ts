import {SynElementImpl} from "../../../../../core/lang/syntax/impl/SynElementImpl";
import {ASTNode} from "../../../../../core/lang/syntax/builder/parser/nodes/ASTNode";
import {SynNodeVisitor} from "../../../../../core/lang/syntax/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";

/**
 *
 * @author Atzitz Amos
 * @date 6/13/2026
 * @since 1.0.0
 */
export class JsStatement extends SynElementImpl {
    public constructor(node: ASTNode) {
        super(node);
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitStatement(this);
        } else {
            super.accept(visitor);
        }
    }

}
