import {JsStatement} from "./JsStatement";
import {ASTNode} from "../../../../../lang/syntax/builder/parser/nodes/ASTNode";
import {JsExpr} from "../expr/JsExpr";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";

/**
 *
 * @author Atzitz Amos
 * @date 9/5/2026
 * @since 1.0.0
 */
export class JsExprStatement extends JsStatement {
    private readonly expr: JsExpr;

    public constructor(node: ASTNode) {
        super(node);
        this.expr = this.getNthChildOfType(JsExpr, 0)!;
    }

    getExpr() {
        return this.expr;
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitExprStatement(this);
        }
        super.accept(visitor);
    }
}
