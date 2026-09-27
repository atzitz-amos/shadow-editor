import {SynASTElementImpl} from "../../../../../lang/syntax/impl/tree/SynASTElementImpl";
import {ASTNode} from "../../../../../lang/syntax/builder/parser/nodes/ASTNode";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {JsLexicalGrammar} from "../../lexer/JsLexicalGrammar";
import {JsExpr} from "../expr/JsExpr";
import {JsSynVisitor} from "../visitors/JsSynVisitor";
import {SynTokenNode} from "../../../../../lang/syntax/impl/SynTokenNode";

/**
 *
 * @author Atzitz Amos
 * @date 6/3/2026
 * @since 1.0.0
 */
export class JsFunctionParameterList extends SynASTElementImpl {
    constructor(node: ASTNode) {
        super(node);
    }

    getParameters(): JsFunctionParameter[] {
        return this.getAllChildrenOfType(JsFunctionParameter);
    }

    getCommas(): SynTokenNode[] {
        return this.getAllTokensOfType(JsLexicalGrammar.COMMA);
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitFunctionParameterList(this);
        }
        super.accept(visitor);
    }
}

export class JsFunctionParameter extends SynASTElementImpl {

    constructor(node: ASTNode) {
        super(node);
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitFunctionParameter(this);
        }
        super.accept(visitor);
    }

    isRest(): boolean {
        return this.getAllTokensOfType(JsLexicalGrammar.ELLIPSIS).length > 0;
    }

    getName(): string {
        return this.getAllTokensOfType(JsLexicalGrammar.IDENTIFIER)[0].getValue();
    }

    hasValue(): boolean {
        const eq = this.getAllTokensOfType(JsLexicalGrammar.COMPARISON_OPERATOR)[0];
        return eq && eq.getValue() == "=";
    }

    getValue(): JsExpr | null {
        const eq = this.getAllTokensOfType(JsLexicalGrammar.COMPARISON_OPERATOR)[0];
        if (!eq)
            return null;
        const valueNode = eq.nextSibling();
        if (!valueNode || !(valueNode instanceof JsExpr))
            return null;
        return valueNode;
    }
}
