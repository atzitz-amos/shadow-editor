import {ASTNode} from "../../../../../lang/syntax/builder/parser/nodes/ASTNode";
import {SynASTElementImpl} from "../../../../../lang/syntax/impl/tree/SynASTElementImpl";
import {HtmlNode} from "./HtmlNode";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {HtmlSynVisitor} from "../visitor/HtmlSynVisitor";

/**
 *
 * @author Atzitz Amos
 * @date 9/22/2026
 * @since 1.0.0
 */
export class HtmlTagBody extends SynASTElementImpl {
    constructor(node: ASTNode) {
        super(node);
    }

    getAllHtmlChildren(): HtmlNode[] {
        return this.getAllChildrenOfType(HtmlNode);
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof HtmlSynVisitor) {
            visitor.visitTagBody(this);
        }

        super.accept(visitor);
    }
}
