import {SynASTElementImpl} from "../../../../../lang/syntax/impl/tree/SynASTElementImpl";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {RISCVSynVisitor} from "../visitor/RISCVSynVisitor";
import {SynTokenNode} from "../../../../../lang/syntax/impl/SynTokenNode";
import {RiscV32LexicalGrammar} from "../../lexer/RiscV32LexicalGrammar";

/**
 *
 * @author Atzitz Amos
 * @date 10/7/2026
 * @since 1.0.0
 */
export abstract class RISCVInstruction extends SynASTElementImpl {
    getMnemonic(): SynTokenNode {
        return this.getAllTokensOfType(RiscV32LexicalGrammar.INSTRUCTION)[0];
    }

    getRegisters(): SynTokenNode[] {
        return this.getAllTokensOfType(RiscV32LexicalGrammar.REGISTER);
    }

    getNumberLiterals(): SynTokenNode[] {
        return this.getAllTokensOfType(RiscV32LexicalGrammar.NUMBER_LITERAL);
    }

    getIdentifiers(): SynTokenNode[] {
        return this.getAllTokensOfType(RiscV32LexicalGrammar.IDENTIFIER);
    }

    accept(visitor: SynNodeVisitor): void {
        if (visitor instanceof RISCVSynVisitor) visitor.visitInstruction(this);
        super.accept(visitor);
    }
}
