import {JsLiteral} from "./JsLiteral";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";
import {JsLexicalGrammar} from "../../lexer/JsLexicalGrammar";
import {JsObjectLiteralValue} from "./JsObjectLiteralValue";
import {SynTokenNode} from "../../../../../lang/syntax/impl/SynTokenNode";
import {JsObjectLiteralKey} from "./JsObjectLiteralKey";
import {JsObjectLiteralPropertyShorthand} from "./JsObjectLiteralPropertyShorthand";

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

    getProperties(): [JsObjectLiteralKey | JsObjectLiteralPropertyShorthand, JsObjectLiteralValue | null][] {
        return this.getElementChildren().filter(x => x instanceof JsObjectLiteralKey || x instanceof JsObjectLiteralPropertyShorthand).map(x => {
            if (x instanceof JsObjectLiteralKey) {
                return [x, x.getValue()];
            }
            return [x, null];
        });
    }

    getComma(value: JsObjectLiteralKey | JsObjectLiteralPropertyShorthand) {
        if (value instanceof JsObjectLiteralKey) {
            const comma = value.nextSibling()?.nextSibling();
            if (comma instanceof SynTokenNode && comma.getTokenType() === JsLexicalGrammar.COMMA) {
                return comma;
            }
            return null;
        }
        const comma = value.nextSibling();
        if (comma instanceof SynTokenNode && comma.getTokenType() === JsLexicalGrammar.COMMA) {
            return comma;
        }
        return null;
    }
}
