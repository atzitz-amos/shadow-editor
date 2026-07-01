import {LanguageBase} from "../../../core/lang/LanguageBase";
import {SynFile} from "../../../core/lang/syntax/api/filesystem/SynFile";
import {Token} from "../../../core/lang/syntax/builder/tokens/Token";
import {TokenHoverAction} from "../../../core/lang/tokenhover/TokenHoverAction";
import {EditorBehaviorContext} from "../../../editor/core/behaviors/context/EditorBehaviorContext";
import {JsLexicalGrammar} from "../lang/lexer/JsLexicalGrammar";
import JsLang from "../lang/JsLang";
import {HighlightOverlay} from "../../../editor/ui/inline/widget/overlay/HighlightOverlay";
import {JsCodeBlock} from "../lang/syntax/JsCodeBlock";
import {JsBinaryExpr} from "../lang/syntax/expr/JsBinaryExpr";
import {TextAttributeKey} from "../../../editor/ui/highlighter/style/TextAttributeKey";
import {TextBackground} from "../../../editor/ui/highlighter/style/TextBackground";

/**
 *
 * @author Atzitz Amos
 * @date 6/26/2026
 * @since 1.0.0
 */
export default class JsShowOperatorPrecedenceOnHover extends TokenHoverAction {
    private static readonly HIGHLIGHT_ATTRIBUTE_KEY = TextAttributeKey.of(new TextBackground("rgb(69 77 73 / 50%)"));

    private leftOverlay: HighlightOverlay;
    private rightOverlay: HighlightOverlay;

    getApplicableLanguages(): LanguageBase[] {
        return [JsLang.class];
    }

    isApplicable(ctx: EditorBehaviorContext, token: Token): boolean {
        return token.getType() === JsLexicalGrammar.LOGICAL_OPERATOR
            || token.getType() === JsLexicalGrammar.BITWISE_OPERATOR
            || token.getType() === JsLexicalGrammar.MATHEMATICAL_OPERATOR
            || token.getType() === JsLexicalGrammar.COMPARISON_OPERATOR;
    }


    getDelay(): number {
        return 500;
    }

    requiresShift(token: Token): boolean {
        return true;
    }

    execute(ctx: EditorBehaviorContext, file: SynFile | null, token: Token): void {
        const codeblock = file?.getChildren()[0];
        if (!codeblock || !(codeblock instanceof JsCodeBlock)) return;

        const expr = codeblock.getDeepestChildAt(token.getRange().getStart())?.getParent();
        if (!expr || !(expr instanceof JsBinaryExpr)) return;

        this.leftOverlay = new HighlightOverlay(expr.getLeft().getTextRange(), JsShowOperatorPrecedenceOnHover.HIGHLIGHT_ATTRIBUTE_KEY);
        this.rightOverlay = new HighlightOverlay(expr.getRight().getTextRange(), JsShowOperatorPrecedenceOnHover.HIGHLIGHT_ATTRIBUTE_KEY);

        ctx.getEditor().getWidgetManager().addOverlayWidget(this.leftOverlay);
        ctx.getEditor().getWidgetManager().addOverlayWidget(this.rightOverlay);

        ctx.getEditor().getView().triggerOverlaysRepaint();
    }

    cleanup(ctx: EditorBehaviorContext): void {
        if (this.leftOverlay) this.leftOverlay.destroy(ctx.getEditor());
        if (this.rightOverlay) this.rightOverlay.destroy(ctx.getEditor());

        ctx.getEditor().getView().triggerOverlaysRepaint();
    }

}
