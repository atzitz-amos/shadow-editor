import {SynASTElementImpl} from "../../../../../lang/syntax/impl/tree/SynASTElementImpl";
import {ASTNode} from "../../../../../lang/syntax/builder/parser/nodes/ASTNode";
import {HtmlAttribute} from "../attribute/HtmlAttribute";
import {HtmlLexicalGrammar} from "../../lexer/HtmlLexicalGrammar";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {HtmlSynVisitor} from "../visitor/HtmlSynVisitor";

/**
 *
 * @author Atzitz Amos
 * @date 9/22/2026
 * @since 1.0.0
 */
export class HtmlOpenTag extends SynASTElementImpl {
    constructor(node: ASTNode) {
        super(node);
    }

    getAttributes(): HtmlAttribute[] {
        return this.getAllChildrenOfType(HtmlAttribute);
    }

    getTagName() {
        return this.getAllTokensOfType(HtmlLexicalGrammar.TAG_NAME)[0];
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof HtmlSynVisitor) {
            visitor.visitOpenTag(this);
        }

        super.accept(visitor);
    }
}
