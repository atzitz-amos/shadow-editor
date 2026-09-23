import {FormattingBlockVisitor} from "../../../../lang/codeStyle/formatter/builder/FormattingBlockVisitor";
import {FormattingEngineBase} from "../../../../lang/codeStyle/formatter/engine/FormattingEngineBase";
import {CodeStyleManager} from "../../../../lang/codeStyle/manager/CodeStyleManager";
import {SpacingFormatter} from "../../../../lang/codeStyle/spacing/SpacingFormatter";
import {TokenType} from "../../../../lang/syntax/builder/tokens/TokenType";
import {HtmlLexicalGrammar} from "../lexer/HtmlLexicalGrammar";

/**
 *
 * @author Atzitz Amos
 * @date 9/22/2026
 * @since 1.0.0
 */
export class HtmlCodeStyleManager extends CodeStyleManager {
    private static instance: HtmlCodeStyleManager | null = null;

    public static getInstance() {
        if (!this.instance)
            this.instance = new HtmlCodeStyleManager();
        return this.instance;
    }

    public getIndentationSize(): number {
        return 2;
    }

    public getWhitespaceTokenGroup(): TokenType[] {
        return [HtmlLexicalGrammar.WHITESPACE]
    }

    public getNewlineTokenGroup(): TokenType[] {
        return [HtmlLexicalGrammar.EOL]
    }

    public getSpacingFormatter(): SpacingFormatter | null {
        return null;
    }

    public getFormattingBlockVisitor(): FormattingBlockVisitor | null {
        return null;
    }

    public getFormattingEngine(): FormattingEngineBase | null {
        return null;
    }

}
