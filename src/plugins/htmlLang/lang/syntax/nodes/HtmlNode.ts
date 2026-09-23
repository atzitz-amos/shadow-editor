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
export abstract class HtmlNode extends SynASTElementImpl {

    constructor(node: ASTNode) {
        super(node);
    }

    abstract getTagName(): string;

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof HtmlSynVisitor) {
            visitor.visitHtmlNode(this);
        }

        super.accept(visitor);
    }
}
