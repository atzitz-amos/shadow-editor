import {ASTNode} from "../../../../../lang/syntax/builder/parser/nodes/ASTNode";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {RISCVSynVisitor} from "../visitor/RISCVSynVisitor";
import {SynTokenNode} from "../../../../../lang/syntax/impl/SynTokenNode";
import {RiscV32LexicalGrammar} from "../../lexer/RiscV32LexicalGrammar";
import {SynASTElementImpl} from "../../../../../lang/syntax/impl/tree/SynASTElementImpl";

/**
 *
 * @author Atzitz Amos
 * @date 10/7/2026
 * @since 1.0.0
 */
export abstract class RiscVDirective extends SynASTElementImpl {
    constructor(node: ASTNode) {
        super(node);
    }

    getDirective(): SynTokenNode {
        return this.getAllTokensOfType(RiscV32LexicalGrammar.DIRECTIVE)[0];
    }

    accept(visitor: SynNodeVisitor): void {
        if (visitor instanceof RISCVSynVisitor) visitor.visitDirective(this);
        super.accept(visitor);
    }

    protected getIdentifiers(): SynTokenNode[] {
        return this.getAllTokensOfType(RiscV32LexicalGrammar.IDENTIFIER);
    }

    protected getNumberLiterals(): SynTokenNode[] {
        return this.getAllTokensOfType(RiscV32LexicalGrammar.NUMBER_LITERAL);
    }

    protected getStringLiterals(): SynTokenNode[] {
        return this.getAllTokensOfType(RiscV32LexicalGrammar.STRING_LITERAL);
    }
}
