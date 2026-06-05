import {JsExpr} from "./JsExpr";
import {ASTNode} from "../../../../../core/lang/syntax/builder/parser/nodes/ASTNode";
import {SynNodeVisitor} from "../../../../../core/lang/syntax/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";

/**
 *
 * @author Atzitz Amos
 * @date 6/3/2026
 * @since 1.0.0
 */
export class JsSpreadExpr extends JsExpr {
    private readonly expr: JsExpr;

    public constructor(node: ASTNode) {
        super(node);

        this.expr = this.findNthChildOfType(JsExpr, 0)!;
    }

    public getExpr(): JsExpr {
        return this.expr;
    }

    public toDebugString(): string {
        return `(...${this.expr.toDebugString()})`;
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitSpreadExpr(this);
        } else {
            super.accept(visitor);
        }
    }
}
