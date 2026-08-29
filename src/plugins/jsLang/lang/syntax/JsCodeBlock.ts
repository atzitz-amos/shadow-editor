import {SynCodeBlock} from "../../../../lang/syntax/api/SynCodeBlock";
import {ASTNode} from "../../../../lang/syntax/builder/parser/nodes/ASTNode";
import {SynNode} from "../../../../lang/syntax/api/SynNode";
import {SynTokenNode} from "../../../../lang/syntax/impl/SynTokenNode";
import {SynNodeVisitor} from "../../../../lang/syntax/visitors/SynNodeVisitor";
import {JsSynVisitor} from "./visitors/JsSynVisitor";
import {JsLexicalGrammar} from "../lexer/JsLexicalGrammar";
import {SynScopeType} from "../../../../lang/indexes/scope/SynScopeType";
import {JsSynUtils} from "./utils/JsSynUtils";

/**
 *
 * @author Atzitz Amos
 * @date 11/23/2025
 * @since 1.0.0
 */
export class JsCodeBlock extends SynCodeBlock {
    private readonly statements: SynNode[] = [];

    constructor(node: ASTNode) {
        super(node);

        for (let child of this.getChildren()) {
            if (!(child instanceof SynTokenNode))
                this.statements.push(child);
        }
    }

    isImplicit(): boolean {
        return this.getAllToken()[0]?.token.getType() !== JsLexicalGrammar.LBRACE;
    }

    getStatements(): SynNode[] {
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
}
