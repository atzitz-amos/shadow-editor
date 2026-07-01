import {JsExpr} from "./JsExpr";
import {ASTNode} from "../../../../../core/lang/syntax/builder/parser/nodes/ASTNode";
import {SynNodeVisitor} from "../../../../../core/lang/syntax/utils/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";

/**
 *
 * @author Atzitz Amos
 * @date 6/6/2026
 * @since 1.0.0
 */
export class JsGroupExpr extends JsExpr {
    private readonly expr: JsExpr;

    public constructor(node: ASTNode) {
        super(node);

        this.expr = this.getNthChildOfType(JsExpr, 0)!;
    }


    getExpr(): JsExpr {
        return this.expr;
    }

    toDebugString(): string {
        return `(${this.expr.toDebugString()})`;
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitGroupExpr(this);
        }

        super.accept(visitor);
    }
}
