import {SpacingFormatter} from "../spacing/SpacingFormatter";
import {TokenType} from "../../syntax/builder/tokens/TokenType";
import {LanguageBase} from "../../LanguageBase";
import {LanguageCodeStyleDefinition} from "../../definitions/LanguageCodeStyleDefinition";
import {FormattingBlockVisitor} from "../formatter/builder/FormattingBlockVisitor";
import {FormattingEngineBase} from "../formatter/engine/FormattingEngineBase";

/**
 *
 * @author Atzitz Amos
 * @date 8/15/2026
 * @since 1.0.0
 */
export abstract class CodeStyleManager {
    public static getInstance(language: LanguageBase | null) {
        return LanguageCodeStyleDefinition.getCodeStyleManager(language);
    }

    public abstract getIndentationSize(): number;

    public abstract getWhitespaceTokenGroup(): TokenType[];

    public abstract getNewlineTokenGroup(): TokenType[];

    public abstract getSpacingFormatter(): SpacingFormatter;

    public abstract getFormattingBlockVisitor(): FormattingBlockVisitor;

    public abstract getFormattingEngine(): FormattingEngineBase;
}