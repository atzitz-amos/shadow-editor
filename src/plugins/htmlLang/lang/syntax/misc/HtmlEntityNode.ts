import {SynASTElementImpl} from "../../../../../lang/syntax/impl/tree/SynASTElementImpl";
import {ASTNode} from "../../../../../lang/syntax/builder/parser/nodes/ASTNode";
import {HtmlParsingUtils} from "../../parser/HtmlParsingUtils";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {HtmlSynVisitor} from "../visitor/HtmlSynVisitor";

/**
 *
 * @author Atzitz Amos
 * @date 9/22/2026
 * @since 1.0.0
 */
export class HtmlEntityNode extends SynASTElementImpl {
    constructor(node: ASTNode) {
        super(node);
    }

    getToken() {
        return this.getAllToken()[0];
    }

    getRenderedText(): string {
        const token = this.getToken();
        return HtmlParsingUtils.decodeHtmlEntity(token.getValue());
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof HtmlSynVisitor) {
            visitor.visitHtmlEntity(this);
        }

        super.accept(visitor);
    }
}
