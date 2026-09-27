import {SynASTElementImpl} from "../../../../../lang/syntax/impl/tree/SynASTElementImpl";
import {ASTNode} from "../../../../../lang/syntax/builder/parser/nodes/ASTNode";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";
import {SynTokenNode} from "../../../../../lang/syntax/impl/SynTokenNode";
import {JsLexicalGrammar} from "../../lexer/JsLexicalGrammar";

/**
 *
 * @author Atzitz Amos
 * @date 6/13/2026
 * @since 1.0.0
 */
export class JsStatement extends SynASTElementImpl {
    public constructor(node: ASTNode) {
        super(node);
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitStatement(this);
        }

        super.accept(visitor);
    }

    getSemicolon(): SynTokenNode | null {
        const semicolon = this.getAllToken().find(token => token.getTokenType() === JsLexicalGrammar.SEMICOLON);
        if (semicolon) {
            return semicolon;
        }
        return null;
    }
}
