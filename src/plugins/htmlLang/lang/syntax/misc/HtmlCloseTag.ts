import {SynASTElementImpl} from "../../../../../lang/syntax/impl/tree/SynASTElementImpl";
import {ASTNode} from "../../../../../lang/syntax/builder/parser/nodes/ASTNode";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {HtmlSynVisitor} from "../visitor/HtmlSynVisitor";

/**
 *
 * @author Atzitz Amos
 * @date 9/22/2026
 * @since 1.0.0
 */
export class HtmlCloseTag extends SynASTElementImpl {

    constructor(node: ASTNode) {
        super(node);
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof HtmlSynVisitor) {
            visitor.visitCloseTag(this);
        }

        super.accept(visitor);
    }
}
