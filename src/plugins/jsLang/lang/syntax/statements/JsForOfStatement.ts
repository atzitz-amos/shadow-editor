import {JsStatement} from "./JsStatement";
import {JsIdentifier} from "../literal/JsIdentifier";
import {JsVariableDeclaration} from "./JsVariableDeclaration";
import {JsExpr} from "../expr/JsExpr";
import {JsCodeBlock} from "../JsCodeBlock";
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
export class JsForOfStatement extends JsStatement {
    private readonly awaitToken: SynTokenNode | undefined;

    private readonly ofToken: SynTokenNode;

    private readonly declarator: JsIdentifier | JsVariableDeclaration;
    private readonly expr: JsExpr;
    private readonly body: JsCodeBlock;

    constructor(node: ASTNode) {
        super(node);

        const allToken = this.getAllTokensOfType(JsLexicalGrammar.IDENTIFIER);
        if (allToken[0].getValue() === "await") {
            this.awaitToken = allToken[0]
            this.ofToken = allToken[1];
        } else {
            this.ofToken = allToken[0];
        }

        this.declarator = this.getElementChildren()[0] as JsIdentifier | JsVariableDeclaration;

        let base = this.declarator instanceof JsVariableDeclaration ? 0 : 1;

        this.expr = this.getNthChildOfType(JsExpr, base)!;
        this.body = this.getNthChildOfType(JsCodeBlock, 0)!;
    }

    getDeclarator() {
        return this.declarator;
    }

    getExpr() {
        return this.expr;
    }

    getBody() {
        return this.body;
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitForOfStatement(this);
        }

        super.accept(visitor);
    }

    getOfToken() {
        return this.ofToken;
    }

    getAwaitToken() {
        return this.awaitToken;
    }
}
