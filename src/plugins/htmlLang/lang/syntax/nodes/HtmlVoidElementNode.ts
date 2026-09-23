import {ASTNode} from "../../../../../lang/syntax/builder/parser/nodes/ASTNode";
import {HtmlTagNode} from "./HtmlTagNode";
import {HtmlCloseTag} from "../misc/HtmlCloseTag";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {HtmlSynVisitor} from "../visitor/HtmlSynVisitor";

/**
 *
 * @author Atzitz Amos
 * @date 9/22/2026
 * @since 1.0.0
 */
export class HtmlVoidElementNode extends HtmlTagNode {

    constructor(node: ASTNode) {
        super(node);
    }

    getCloseTag(): HtmlCloseTag | null {
        return this.getOpenTag();
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof HtmlSynVisitor) {
            visitor.visitVoidElementNode(this);
        }

        super.accept(visitor);
    }
}
