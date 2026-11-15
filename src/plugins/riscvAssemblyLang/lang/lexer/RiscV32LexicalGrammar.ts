import {LexicalGrammar} from "../../../../lang/syntax/builder/lexer/LexicalGrammar";
import {LexicalBuilder} from "../../../../lang/syntax/builder/tokens/TokenType";

export class RiscV32LexicalGrammar implements LexicalGrammar {
// ---------------------------------------------------------------- Skippable

    public static readonly EOL = LexicalBuilder.makeSkippable("EOL");
    public static readonly WHITESPACE = LexicalBuilder.makeSkippable("WHITESPACE");

// ---------------------------------------------------------------- Comments

    /** '# ...' (GNU as) or '// ...' (LLVM). */
    public static readonly SINGLE_LINE_COMMENT = LexicalBuilder.makeComment("SINGLE_LINE_COMMENT");
    public static readonly MULTI_LINE_COMMENT = LexicalBuilder.makeComment("MULTI_LINE_COMMENT");

// ---------------------------------------------------------------- Words

    /** Instruction mnemonic, e.g. addi, lw, fadd.s, amoadd.w.aqrl, c.addi, li, ret */
    public static readonly INSTRUCTION = LexicalBuilder.make("INSTRUCTION");

    /** Integer register: x0-x31, zero, ra, sp, gp, tp, fp, a0-a7, t0-t6, s0-s11 */
    public static readonly REGISTER = LexicalBuilder.make("REGISTER");

    /** Control and status register: mstatus, mie, mip, mtvec, mepc, mcause */
    public static readonly CSR = LexicalBuilder.make("CSR");

    /** Assembler directive, e.g. .text, .globl, .word, .align */
    public static readonly DIRECTIVE = LexicalBuilder.make("DIRECTIVE");

    /** Label definition: a name (or numeric local label) directly followed by ':', e.g. `loop:`, `.L1:`, `1:`. The ':' itself is a separate COLON token. */
    public static readonly LABEL = LexicalBuilder.make("LABEL");

    /** Plain symbol name (reference to a label or constant). Includes local labels such as .L1 */
    public static readonly IDENTIFIER = LexicalBuilder.make("IDENTIFIER");

    /** Numeric local label reference: 1f (forward), 1b (backward). */
    public static readonly LOCAL_LABEL_REF = LexicalBuilder.make("LOCAL_LABEL_REF");

    /** Relocation operator: %hi, %lo, %pcrel_hi, %pcrel_lo, %got_pcrel_hi, %tprel_add ... */
    public static readonly RELOCATION = LexicalBuilder.make("RELOCATION");

    /** Symbol attribute, e.g. @function, @object (used by .type). */
    public static readonly AT_ATTRIBUTE = LexicalBuilder.make("AT_ATTRIBUTE");

// ---------------------------------------------------------------- Literals

    /** Decimal, hex (0x), binary (0b), octal (0o) */
    public static readonly NUMBER_LITERAL = LexicalBuilder.make("NUMBER_LITERAL", /0[xX][0-9a-fA-F]+|0[bB][01]+|0[oO][0-7]+|\d+/);

    public static readonly STRING_LITERAL = LexicalBuilder.make("STRING_LITERAL", /"(?:\\.|[^"\\\n])*"?/);

    public static readonly CHAR_LITERAL = LexicalBuilder.make("CHAR_LITERAL", /'(?:\\.|[^'\\\n])'?/);

// ---------------------------------------------------------------- Operators (for expressions)

    public static readonly MATHEMATICAL_OPERATOR = LexicalBuilder.make("MATHEMATICAL_OPERATOR", /[+\-*/%]/);
    public static readonly BITWISE_OPERATOR = LexicalBuilder.make("BITWISE_OPERATOR", /<<|>>|[&|^~]/);
    public static readonly LOGICAL_OPERATOR = LexicalBuilder.make("LOGICAL_OPERATOR", /&&|\|\||!/);
    public static readonly COMPARISON_OPERATOR = LexicalBuilder.make("COMPARISON_OPERATOR", /==|!=|<=|>=|<>|<|>/);
    /** '=' used by `sym = expr` */
    public static readonly ASSIGNMENT_OPERATOR = LexicalBuilder.make("ASSIGNMENT", /=/);

// ---------------------------------------------------------------- Punctuation

    public static readonly LPAREN = LexicalBuilder.make("LPAREN");
    public static readonly RPAREN = LexicalBuilder.make("RPAREN");
    public static readonly COMMA = LexicalBuilder.make("COMMA");
    public static readonly COLON = LexicalBuilder.make("COLON");
    public static readonly SEMICOLON = LexicalBuilder.make("SEMICOLON");
    /** Current location counter '.' */
    public static readonly DOT = LexicalBuilder.make("DOT");

// ---------------------------------------------------------------- Lookup tables

    public static readonly REGISTER_SET: Set<string> = new Set([
        // numeric registers
        ...Array.from({length: 32}, (_, i) => `x${i}`),
        // ABI registers
        "zero", "ra", "sp", "gp", "tp", "fp",
        ...Array.from({length: 7}, (_, i) => `t${i}`),
        ...Array.from({length: 12}, (_, i) => `s${i}`),
        ...Array.from({length: 8}, (_, i) => `a${i}`),
    ]);

    public static readonly CSR_SET: Set<string> = new Set([
        "mstatus", "mie", "mip", "mtvec", "mepc", "mcause",
    ]);

    public static readonly INSTRUCTION_SET: Set<string> = new Set([
        // ---- Move
        "nop", "mv", "li", "la", "lui", "auipc",
        // ---- Arithmetic
        "add", "addi", "sub", "neg",
        // ---- Logical
        "xor", "xori", "or", "ori", "and", "andi", "not",
        // ---- Shift
        "sll", "slli", "srl", "srli", "sra", "srai",
        // ---- Compare
        "slt", "slti", "sltu", "sltiu", "seqz", "snez", "sltz", "sgtz",
        // ---- Memory
        "lb", "lbu", "lh", "lhu", "lw", "sb", "sh", "sw",
        // ---- Branch
        "beq", "bne", "blt", "bltu", "bge", "bgeu",
        "ble", "bleu", "bgt", "bgtu",
        "beqz", "bnez", "bltz", "bgez", "blez", "bgtz",
        // ---- Jump
        "j", "jal", "ret", "call", "jalr",
        // ---- M-mode
        "csrr", "csrw", "csrs", "csrc", "csrwi", "csrsi", "csrci",
        "csrrw", "csrrs", "csrrc", "csrrwi", "csrrsi", "csrrci",
        "mret",
    ]);

    public static readonly DIRECTIVE_LIST: Set<string> = new Set([
        ".text", ".data", ".asciiz", ".byte", ".word", ".equ",
    ]);
}