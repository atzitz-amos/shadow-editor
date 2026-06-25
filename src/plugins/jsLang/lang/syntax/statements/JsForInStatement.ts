import {JsStatement} from "./JsStatement";
import {ASTNode} from "../../../../../core/lang/syntax/builder/parser/nodes/ASTNode";
import {SynNodeVisitor} from "../../../../../core/lang/syntax/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";
import {JsIdentifier} from "../literal/JsIdentifier";
import {JsVariableDeclaration} from "./JsVariableDeclaration";
import {JsExpr} from "../expr/JsExpr";
import {JsCodeBlock} from "../JsCodeBlock";

/**
 *
 * @author Atzitz Amos
 * @date 6/13/2026
 * @since 1.0.0
 */
export class JsForInStatement extends JsStatement {
    private readonly declarator: JsIdentifier | JsVariableDeclaration;
    private readonly expr: JsExpr;
    private readonly body: JsCodeBlock;

    constructor(node: ASTNode) {
        super(node);

        this.declarator = this.getElementChildren()[0] as JsIdentifier | JsVariableDeclaration;

        let base = this.declarator instanceof JsVariableDeclaration ? 0 : 1;

        this.expr = this.findNthChildOfType(JsExpr, base)!;
        this.body = this.findNthChildOfType(JsCodeBlock, 0)!;
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
            visitor.visitForInStatement(this);
        } else {
            super.accept(visitor);
        }
    }
}
