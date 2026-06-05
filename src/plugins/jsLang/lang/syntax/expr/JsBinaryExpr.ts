import {ASTNode} from "../../../../../core/lang/syntax/builder/parser/nodes/ASTNode";
import {SynNodeVisitor} from "../../../../../core/lang/syntax/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";
import {JsExpr} from "./JsExpr";
import {SynTokenNode} from "../../../../../core/lang/syntax/impl/SynTokenNode";

/**
 *
 * @author Atzitz Amos
 * @date 11/23/2025
 * @since 1.0.0
 */
export class JsBinaryExpr extends JsExpr {
    private readonly left: JsExpr;
    private readonly operator: SynTokenNode;
    private readonly right: JsExpr;

    constructor(node: ASTNode) {
        super(node);
        this.left = this.findNthChild(0) as JsExpr;
        this.operator = this.findNthChild(1) as SynTokenNode;
        this.right = this.findNthChild(2) as JsExpr;
    }

    getLeft(): JsExpr {
        return this.left;
    }

    getOperator(): SynTokenNode {
        return this.operator;
    }

    getRight(): JsExpr {
        return this.right;
    }

    public toDebugString(): string {
        return `(${this.left.toDebugString()} ${this.operator.getValue()} ${this.right.toDebugString()})`;
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitBinaryExpr(this);
        } else {
            super.accept(visitor);
        }
    }
}
