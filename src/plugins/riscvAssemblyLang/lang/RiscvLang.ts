import {HighlighterBase} from "../../../lang/highlighter/HighlighterBase";
import {LanguageBase} from "../../../lang/LanguageBase";
import {ILexer} from "../../../lang/syntax/builder/lexer/ILexer";
import RiscV32IncrLexer from "./lexer/RiscV32IncrLexer";
import {RiscV32Highlighter} from "./highlighter/RiscV32Highlighter";

/**
 *
 * @author Atzitz Amos
 * @date 10/6/2026
 * @since 1.0.0
 */
export default class RiscV32Lang extends LanguageBase {
    public static INSTANCE: RiscV32Lang;

    private constructor() {
        super();
        RiscV32Lang.INSTANCE = this;
    }

    public getKey(): string {
        return "riscv-assembly";
    }

    public getDisplayName(): string {
        return "RISC-V Assembly";
    }

    public getDefaultExtension(): string {
        return "s";
    }

    public createLexer(): ILexer {
        return new RiscV32IncrLexer();
    }

    public createHighlighter(): HighlighterBase {
        return new RiscV32Highlighter();
    }

}
