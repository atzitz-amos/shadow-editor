import {ASTNode} from "../../../../../core/lang/syntax/builder/parser/nodes/ASTNode";
import {JsExpr} from "./JsExpr";
import {SynNodeVisitor} from "../../../../../core/lang/syntax/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";

/**
 *
 * @author Atzitz Amos
 * @date 11/27/2025
 * @since 1.0.0
 */
export class JsCallExpr extends JsExpr {
    private readonly callee: JsExpr;
    private readonly argumentsExpr: JsExpr[];

    constructor(node: ASTNode) {
        super(node);
        this.callee = this.findNthChild(0) as JsExpr;
        this.argumentsExpr = [];

        for (let i = 2; ; i++) {
            const child = this.findNthChild(i);
            if (!child) {
                break;
            }
            if (child instanceof JsExpr) {
                this.argumentsExpr.push(child);
            }
        }
    }

    getCallee(): JsExpr {
        return this.callee;
    }

    getArguments(): JsExpr[] {
        return this.argumentsExpr;
    }

    public toDebugString(): string {
        return `(${this.callee.toDebugString()} (${this.argumentsExpr.map(arg => arg.toDebugString()).join(", ")}))`;
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitCallExpr(this);
        } else {
            super.accept(visitor);
        }
    }
}
