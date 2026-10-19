import {IParser} from "../../../../lang/syntax/builder/parser/IParser";
import {ASTBuilder} from "../../../../lang/syntax/builder/parser/builder/ASTBuilder";
import {RiscV32LexicalGrammar} from "../lexer/RiscV32LexicalGrammar";
import {RiscVGrammar} from "./RiscVGrammar";

/**
 *
 * @author Atzitz Amos
 * @date 10/6/2026
 * @since 1.0.0
 */
export class RiscVParser implements IParser {

    constructor(private readonly builder: ASTBuilder) {
    }

    parse(): void {
        const marker = this.builder.mark();
        while (!this.builder.done()) {
            this.parseLine();
        }
        marker.done(RiscVGrammar.Program);
    }

    parseUntilLabel(): void {
        while (!this.builder.done() && !this.builder.seek()!.isType(RiscV32LexicalGrammar.LABEL)) {
            this.parseLine();
        }
    }

    parseLine() {
        const next = this.builder.seek()!;

        if (next.isType(RiscV32LexicalGrammar.DIRECTIVE)) {
            this.parseDirective();
        } else if (next.isType(RiscV32LexicalGrammar.INSTRUCTION)) {
            this.parseInstruction();
        } else if (next.isType(RiscV32LexicalGrammar.LABEL)) {
            this.parseLabel();
        } else {
            this.builder.advance(); // Consume the unexpected token
            this.builder.popAndError(`Unexpected token: ${next.getValue()}`);
        }
    }

    parseDirective() {
        const marker = this.builder.mark();
        const token = this.builder.advance()!; // Consume the directive token
        if ([".text", ".data"].includes(token.getValue())) {
            this.builder.advance(); // Consume the directive token
            marker.done(RiscVGrammar.SectionDirective);
        } else if (token.getValue() === ".section") {
            this.builder.expect(RiscV32LexicalGrammar.STRING_LITERAL).failWith("Expected string literal after 'section' directive");
            marker.done(RiscVGrammar.SectionDirective);
        } else if ([".globl", ".global"].includes(token.getValue())) {
            this.builder.expect(RiscV32LexicalGrammar.IDENTIFIER).failWith("Expected identifier after 'globl' directive");
            marker.done(RiscVGrammar.SectionDirective);
        } else if (token.getValue() === ".equ") {
            this.builder.expect(RiscV32LexicalGrammar.IDENTIFIER).failWith("Expected identifier after 'equ' directive");
            this.builder.consumeIf(RiscV32LexicalGrammar.COMMA); // Optionally consume a comma
            this.parseNumberLiteral("Expected number literal after identifier in 'equ' directive");
            marker.done(RiscVGrammar.EquDirective);
        } else if ([".word", ".byte"].includes(token.getValue())) {
            while (!this.builder.done() && this.builder.seek()!.isType(RiscV32LexicalGrammar.NUMBER_LITERAL)) {
                this.parseNumberLiteral();
                if (!this.builder.done() && this.builder.seek()!.isType(RiscV32LexicalGrammar.COMMA)) {
                    this.builder.advance(); // Consume the comma
                } else {
                    break; // No more number literals or commas
                }
            }
            marker.done(RiscVGrammar.MemoryDirective);
        } else if (token.getValue() === "asciiz") {
            this.builder.expect(RiscV32LexicalGrammar.STRING_LITERAL).failWith("Expected string literal after 'asciiz' directive");
            marker.done(RiscVGrammar.MemoryDirective);
        } else {
            this.builder.popAndError(`Unexpected directive: ${token.getValue()}`)
        }
    }

    parseInstruction() {
        const name = this.builder.seek()!;
        switch (name.getValue()) {
            case "mv":
                this.parseMoveInstruction();
                break;
            case "li":
            case "lui":
                this.parseLiInstruction();
                break;
            case "la":
                this.parseLaInstruction();
                break;
            case "add":
            case "sub":
            case "xor":
            case "or":
            case "and":
            case "sll":
            case "srl":
            case "sra":
            case "slt":
            case "sltu":
                this.parseRTypeInstruction();
                break;
            case "addi":
            case "xori":
            case "ori":
            case "andi":
            case "slli":
            case "srli":
            case "srai":
            case "slti":
            case "sltiu":
                this.parseITypeInstruction();
                break;
            case "neg":
            case "not":
                this.parseUnaryInstruction();
                break;
            case "j":
                this.parseJumpInstruction();
                break;
            case "jal":
                this.parseJalInstruction();
                break;
            case "ret":
                this.parseRetInstruction();
                break;
            case "beq":
            case "bne":
            case "blt":
            case "bltu":
            case "bge":
            case "bgeu":
            case "ble":
            case "bleu":
            case "bgt":
            case "bgtu":
                this.parseBranchInstruction();
                break;
            case "beqz":
            case "bnez":
            case "bltz":
            case "bgtz":
            case "blez":
            case "bgez":
                this.parseBranchZInstruction();
                break;
            case "seqz":
            case "snez":
            case "sltz":
            case "sgtz":
                this.parseCompareZInstruction();
                break;
            case "sb":
            case "sh":
            case "sw":
                this.parseStoreInstruction();
                break;
            case "lb":
            case "lbu":
            case "lh":
            case "lhu":
            case "lw":
                this.parseLoadInstruction();
                break;
            default:
                this.builder.advance();
                this.builder.popAndError(`Unexpected instruction: ${name.getValue()}`);

        }
    }

    parseMoveInstruction() {
        const marker = this.builder.mark();
        this.builder.advance(); // Consume the 'mv' instruction token
        this.parseRegister("Expected register after 'mv' instruction");
        this.builder.expect(RiscV32LexicalGrammar.COMMA).failWith("Expected ',' after destination register in 'mv' instruction");
        this.parseRegister("Expected source register after ',' in 'mv' instruction");
        marker.done(RiscVGrammar.MoveInstruction);
    }

    parseLiInstruction() {
        const marker = this.builder.mark();
        this.builder.advance(); // Consume the 'li' or 'lui' instruction token
        this.parseRegister("Expected register after 'li' or 'lui' instruction");
        this.builder.expect(RiscV32LexicalGrammar.COMMA).failWith("Expected ',' after destination register in 'li' or 'lui' instruction");
        this.parseImmediateOrValue();
        marker.done(RiscVGrammar.LoadImmediateInstruction);
    }

    parseLaInstruction() {
        const marker = this.builder.mark();
        this.builder.advance(); // Consume the 'la' instruction token
        this.parseRegister("Expected register after 'la' instruction");
        this.builder
            .expect(RiscV32LexicalGrammar.COMMA).failWith("Expected ',' after destination register in 'la' instruction");
        this.parseLabelReference("Expected label after ',' in 'la' instruction");
        marker.done(RiscVGrammar.LoadAddressInstruction);
    }

    parseRTypeInstruction() {
        const marker = this.builder.mark();
        this.builder.advance(); // Consume the R-type instruction token
        this.parseRegister("Expected destination register after R-type instruction");
        this.builder.expect(RiscV32LexicalGrammar.COMMA).failWith("Expected ',' after destination register in R-type instruction");
        this.parseRegister("Expected source register after ',' in R-type instruction");
        this.builder.expect(RiscV32LexicalGrammar.COMMA).failWith("Expected ',' after source register in R-type instruction");
        this.parseRegister("Expected second source register after ',' in R-type instruction");
        marker.done(RiscVGrammar.RTypeInstruction);
    }

    parseITypeInstruction() {
        const marker = this.builder.mark();
        this.builder.advance(); // Consume the I-type instruction token
        this.parseRegister("Expected destination register after I-type instruction");
        this.builder.expect(RiscV32LexicalGrammar.COMMA).failWith("Expected ',' after destination register in I-type instruction");
        this.parseRegister("Expected source register after ',' in I-type instruction");
        this.builder.expect(RiscV32LexicalGrammar.COMMA).failWith("Expected ',' after source register in I-type instruction");
        this.parseImmediateOrValue();
        marker.done(RiscVGrammar.ITypeInstruction);
    }

    parseUnaryInstruction() {
        const marker = this.builder.mark();
        this.builder.advance(); // Consume the unary instruction token
        this.parseRegister("Expected destination register after unary instruction");
        this.builder.expect(RiscV32LexicalGrammar.COMMA).failWith("Expected ',' after destination register in unary instruction");
        this.parseRegister("Expected source register after ',' in unary instruction");
        marker.done(RiscVGrammar.UnaryInstruction);
    }

    parseJumpInstruction() {
        const marker = this.builder.mark();
        this.builder.advance(); // Consume the 'j' instruction token
        this.parseLabelReference("Expected label after 'j' instruction");
        marker.done(RiscVGrammar.JumpInstruction);
    }

    parseJalInstruction() {
        const marker = this.builder.mark();
        this.builder.advance(); // Consume the 'jal' instruction token
        this.parseLabelReference("Expected label after ',' in 'jal' instruction");
        marker.done(RiscVGrammar.JalInstruction);
    }

    parseRetInstruction() {
        const marker = this.builder.mark();
        this.builder.advance(); // Consume the 'ret' instruction token
        marker.done(RiscVGrammar.RetInstruction);
    }

    parseBranchInstruction() {
        const marker = this.builder.mark();
        this.builder.advance(); // Consume the branch instruction token
        this.parseRegister("Expected first source register after branch instruction");
        this.builder.expect(RiscV32LexicalGrammar.COMMA).failWith("Expected ',' after first source register in branch instruction");
        this.parseRegister("Expected second source register after ',' in branch instruction");
        this.builder
            .expect(RiscV32LexicalGrammar.COMMA).failWith("Expected ',' after second source register in branch instruction");
        this.parseLabelReference("Expected label after ',' in branch instruction");
        marker.done(RiscVGrammar.BranchInstruction);
    }

    parseBranchZInstruction() {
        const marker = this.builder.mark();
        this.builder.advance(); // Consume the branch zero instruction token
        this.parseRegister("Expected source register after branch zero instruction");
        this.builder
            .expect(RiscV32LexicalGrammar.COMMA).failWith("Expected ',' after source register in branch zero instruction");
        this.parseLabelReference("Expected label after ',' in branch zero instruction");
        marker.done(RiscVGrammar.BranchZInstruction);
    }

    parseCompareZInstruction() {
        const marker = this.builder.mark();
        this.builder.advance(); // Consume the compare zero instruction token
        this.parseRegister("Expected destination register after compare zero instruction");
        this.builder.expect(RiscV32LexicalGrammar.COMMA).failWith("Expected ',' after destination register in compare zero instruction");
        this.parseRegister("Expected source register after ',' in compare zero instruction");
        marker.done(RiscVGrammar.CompareZInstruction);
    }

    parseStoreInstruction() {
        const marker = this.builder.mark();
        this.builder.advance(); // Consume the store instruction token
        this.parseRegister("Expected destination register after store instruction");
        this.builder.expect(RiscV32LexicalGrammar.COMMA).failWith("Expected ',' after destination register in store instruction")
            .then(() => this.parseNumberLiteral("Expected offset after ',' in store instruction"))
            .then(RiscV32LexicalGrammar.LPAREN).failWith("Expected '(' after offset in store instruction")
            .then(() => this.parseRegister("Expected base register after '(' in store instruction"))
            .then(RiscV32LexicalGrammar.RPAREN).failWith("Expected ')' after base register in store instruction");
        marker.done(RiscVGrammar.StoreInstruction);
    }

    parseLoadInstruction() {
        const marker = this.builder.mark();
        this.builder.advance(); // Consume the load instruction token
        this.parseRegister("Expected destination register after load instruction");
        this.builder
            .expect(RiscV32LexicalGrammar.COMMA).failWith("Expected ',' after destination register in load instruction");
        this.parseNumberLiteral("Expected offset after ',' in load instruction");
        this.builder.expect(RiscV32LexicalGrammar.LPAREN).failWith("Expected '(' after offset in load instruction");
        this.parseRegister("Expected base register after '(' in load instruction");
        this.builder.expect(RiscV32LexicalGrammar.RPAREN).failWith("Expected ')' after base register in load instruction");
        marker.done(RiscVGrammar.LoadInstruction);
    }

    parseLabel() {
        const marker = this.builder.mark();
        this.builder.advance(); // Consume the label token
        this.builder.expect(RiscV32LexicalGrammar.COLON).failWith("Expected ':' after label declaration");
        this.parseUntilLabel();
        marker.done(RiscVGrammar.LabelDeclaration);
    }

    parseImmediateOrValue() {
        if (this.builder.isNext(RiscV32LexicalGrammar.NUMBER_LITERAL)) {
            this.parseNumberLiteral();
        } else if (this.builder.isNext(RiscV32LexicalGrammar.IDENTIFIER)) {
            this.parseLabelReference();
        } else {
            this.builder.popAndError("Expected immediate value or label");
        }
    }

    parseNumberLiteral(msg?: string): void {
        const marker = this.builder.mark();
        this.builder.expect(RiscV32LexicalGrammar.NUMBER_LITERAL).failWith(msg ?? "Expected number literal");
        marker.done(RiscVGrammar.NumberLiteral);
    }

    parseLabelReference(msg?: string): void {
        const marker = this.builder.mark();
        this.builder.expect(RiscV32LexicalGrammar.IDENTIFIER).failWith(msg ?? "Expected label");
        marker.done(RiscVGrammar.LabelReference);
    }

    parseRegister(msg?: string): void {
        const marker = this.builder.mark();
        this.builder.expect(RiscV32LexicalGrammar.REGISTER).failWith(msg ?? "Expected register");
        marker.done(RiscVGrammar.Register);
    }
}
