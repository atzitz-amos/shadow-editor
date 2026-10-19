import {TextColor} from "../../../../editor/ui/highlighter/style/TextColor";

export class RiscV32ColorScheme {
    public static readonly DEFAULT_COLOR = TextColor.of("#aeb0b6");
    public static readonly PUNCTUATION_COLOR = TextColor.of("#8b92a2");
    public static readonly STRING_COLOR = TextColor.of("#e3bd82");
    public static readonly COMMENT_COLOR = TextColor.of("#727b8b");
    public static readonly NUMBER_COLOR = TextColor.of("#919152");
    public static readonly UNEXPECTED_COLOR = TextColor.of("#f06292");

    /** Instruction mnemonics: addi, lw, beq, ret ... */
    public static readonly INSTRUCTION_COLOR = TextColor.of("#80aaea");
    /** Registers: a0, sp, x5 ... */
    public static readonly REGISTER_COLOR = TextColor.of("#a2a3a4");
    /** CSR names: mstatus, mepc ... */
    public static readonly CSR_COLOR = TextColor.of("#d19a66");
    /** Directives (.text, .word) and relocations (%hi, %lo) */
    public static readonly DIRECTIVE_COLOR = TextColor.of("#b58fd9");
    /** Symbol references: plain identifiers and local label references (1f, 1b) */
    public static readonly IDENTIFIER_COLOR = TextColor.of("#759e90");
    /** Label definitions: `loop:`, `1:` */
    public static readonly LABEL_COLOR = TextColor.of("#759e90");
}