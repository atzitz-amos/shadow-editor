import {SynASTElementImpl} from "../../../../../lang/syntax/impl/tree/SynASTElementImpl";
import {ASTNode} from "../../../../../lang/syntax/builder/parser/nodes/ASTNode";
import {JsExpr} from "./JsExpr";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";
import {SynTokenNode} from "../../../../../lang/syntax/impl/SynTokenNode";
import {JsLexicalGrammar} from "../../lexer/JsLexicalGrammar";

/**
 *
 * @author Atzitz Amos
 * @date 9/27/2026
 * @since 1.0.0
 */
export class JsArgumentList extends SynASTElementImpl {
    private readonly arguments: JsExpr[];

    constructor(node: ASTNode) {
        super(node);

        this.arguments = this.getAllChildrenOfType(JsExpr);
    }

    getArguments(): JsExpr[] {
        return this.arguments;
    }

    getCommas(): SynTokenNode[] {
        return this.getAllTokensOfType(JsLexicalGrammar.COMMA);
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitArgumentList(this);
        }
        super.accept(visitor);
    }
}
