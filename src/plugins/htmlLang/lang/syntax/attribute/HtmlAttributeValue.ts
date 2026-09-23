import {SynASTElementImpl} from "../../../../../lang/syntax/impl/tree/SynASTElementImpl";
import {ASTNode} from "../../../../../lang/syntax/builder/parser/nodes/ASTNode";
import {SynTokenNode} from "../../../../../lang/syntax/impl/SynTokenNode";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {HtmlSynVisitor} from "../visitor/HtmlSynVisitor";

/**
 *
 * @author Atzitz Amos
 * @date 9/22/2026
 * @since 1.0.0
 */
export class HtmlAttributeValue extends SynASTElementImpl {
    constructor(node: ASTNode) {
        super(node);
    }

    getEqToken(): SynTokenNode {
        return this.getAllToken()[0];
    }

    getValueToken(): SynTokenNode {
        return this.getAllToken()[1];
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof HtmlSynVisitor) {
            visitor.visitHtmlAttributeValue(this);
        }

        super.accept(visitor);
    }
}
