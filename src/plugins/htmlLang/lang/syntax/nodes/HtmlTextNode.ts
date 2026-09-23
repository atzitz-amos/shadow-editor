import {ASTNode} from "../../../../../lang/syntax/builder/parser/nodes/ASTNode";
import {HtmlNode} from "./HtmlNode";
import {HtmlEntityNode} from "../misc/HtmlEntityNode";
import {SynTokenNode} from "../../../../../lang/syntax/impl/SynTokenNode";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {HtmlSynVisitor} from "../visitor/HtmlSynVisitor";

/**
 *
 * @author Atzitz Amos
 * @date 9/22/2026
 * @since 1.0.0
 */
export class HtmlTextNode extends HtmlNode {

    constructor(node: ASTNode) {
        super(node);
    }

    getRenderedText(): string {
        let result = "";
        for (const child of this.getChildren()) {
            if (child instanceof SynTokenNode) {
                result += child.getValue();
            } else if (child instanceof HtmlEntityNode) {
                result += child.getRenderedText();
            }
        }
        return result;
    }

    getTagName(): string {
        return "#text";
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof HtmlSynVisitor) {
            visitor.visitHtmlTextNode(this);
        }

        super.accept(visitor);
    }
}
