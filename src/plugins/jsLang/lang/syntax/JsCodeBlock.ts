import {SynCodeBlock} from "../../../../lang/syntax/api/SynCodeBlock";
import {ASTNode} from "../../../../lang/syntax/builder/parser/nodes/ASTNode";
import {SynNodeVisitor} from "../../../../lang/syntax/visitors/SynNodeVisitor";
import {JsSynVisitor} from "./visitors/JsSynVisitor";
import {JsLexicalGrammar} from "../lexer/JsLexicalGrammar";
import {SynScopeType} from "../../../../lang/indexes/scope/SynScopeType";
import {JsSynUtils} from "./utils/JsSynUtils";
import {SynASTElementImpl} from "../../../../lang/syntax/impl/tree/SynASTElementImpl";
import {JsStatement} from "./statements/JsStatement";
import {SynTokenNode} from "../../../../lang/syntax/impl/SynTokenNode";

/**
 *
 * @author Atzitz Amos
 * @date 11/23/2025
 * @since 1.0.0
 */
export class JsCodeBlock extends SynCodeBlock {
    private readonly statements: SynASTElementImpl[];

    constructor(node: ASTNode) {
        super(node);

        this.statements = this.getAllChildrenOfType(JsStatement);
    }

    isImplicit(): boolean {
        return this.getOpeningBrace() === undefined && this.getClosingBrace() === undefined;
    }

    getStatements(): SynASTElementImpl[] {
        return this.statements;
    }

    getAssociatedScopeType(): SynScopeType | null {
        const parent = this.getParent();
        if (!parent) return SynScopeType.GLOBAL;
        else if (JsSynUtils.isFunction(parent)) return SynScopeType.FUNCTION;
        else return SynScopeType.BLOCK;
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitJsCodeBlock(this);
        }
        super.accept(visitor);
    }

    getSemicolon(statement: JsStatement): SynTokenNode | null {
        let node = statement.nextSibling();
        if (node instanceof SynTokenNode && node.getTokenType() === JsLexicalGrammar.SEMICOLON) {
            return node;
        }
        return null;
    }
}
