import {JsLiteral} from "./JsLiteral";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";
import {JsLexicalGrammar} from "../../lexer/JsLexicalGrammar";

/**
 *
 * @author Atzitz Amos
 * @date 9/4/2026
 * @since 1.0.0
 */
export class JsObjectLiteral extends JsLiteral {

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitObjectLiteral(this);
        }
        super.accept(visitor);
    }

    getOpeningBrace() {
        return this.getAllTokensOfType(JsLexicalGrammar.LBRACE)[0];
    }

    getClosingBrace() {
        return this.getAllTokensOfType(JsLexicalGrammar.RBRACE)[0];
    }
}
