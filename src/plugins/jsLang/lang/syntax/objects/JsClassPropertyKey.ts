import {JsIdentifier} from "../literal/JsIdentifier";
import {SynTokenNode} from "../../../../../lang/syntax/impl/SynTokenNode";
import {JsExpr} from "../expr/JsExpr";
import {TextRange} from "../../../../../editor/core/coordinate/range/TextRange";

/**
 *
 * @author Atzitz Amos
 * @date 8/5/2026
 * @since 1.0.0
 */
export type JsClassPropertyKey = JsIdentifier | JsPrivatePropertyName | JsComputedPropertyName


export class JsPrivatePropertyName {
    constructor(private hashtagToken: SynTokenNode, private identifier: JsIdentifier) {
    }

    getHashtagToken(): SynTokenNode {
        return this.hashtagToken;
    }

    getIdentifier(): JsIdentifier {
        return this.identifier;
    }

    getTextRange(): TextRange {
        return new TextRange(this.hashtagToken.getTextRange().start, this.identifier.getTextRange().end);
    }
}

export class JsComputedPropertyName {
    constructor(private openBracketToken: SynTokenNode, private expression: JsExpr, private closeBracketToken: SynTokenNode) {
    }

    getOpenBracketToken(): SynTokenNode {
        return this.openBracketToken;
    }

    getCloseBracketToken(): SynTokenNode {
        return this.closeBracketToken;
    }

    getExpression(): JsExpr {
        return this.expression;
    }

    getTextRange(): TextRange {
        return new TextRange(this.openBracketToken.getTextRange().start, this.closeBracketToken.getTextRange().end);
    }
}