import {ASTNode} from "../../../../../core/lang/syntax/builder/parser/nodes/ASTNode";
import {SynNodeVisitor} from "../../../../../core/lang/syntax/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";
import {JsExpr} from "./JsExpr";

/**
 *
 * @author Atzitz Amos
 * @date 11/27/2025
 * @since 1.0.0
 */
export class JsTernaryExpr extends JsExpr {
    private readonly condition: JsExpr;
    private readonly trueExpr: JsExpr;
    private readonly falseExpr: JsExpr;

    constructor(node: ASTNode) {
        super(node);
        this.condition = this.findNthChild(0) as JsExpr;
        this.trueExpr = this.findNthChild(2) as JsExpr;
        this.falseExpr = this.findNthChild(4) as JsExpr;
    }

    getCondition(): JsExpr {
        return this.condition;
    }

    getTrueExpr(): JsExpr {
        return this.trueExpr;
    }

    getFalseExpr(): JsExpr {
        return this.falseExpr;
    }

    public toDebugString(): string {
        return `(${this.condition.toDebugString()} ? ${this.trueExpr.toDebugString()} : ${this.falseExpr.toDebugString()})`;
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitTernaryExpr(this);
        } else {
            super.accept(visitor);
        }
    }
}
