import {JsExpr} from "./JsExpr";
import {ASTNode} from "../../../../../core/lang/syntax/builder/parser/nodes/ASTNode";
import {SynNodeVisitor} from "../../../../../core/lang/syntax/utils/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";
import {SynTokenNode} from "../../../../../core/lang/syntax/impl/SynTokenNode";

/**
 *
 * @author Atzitz Amos
 * @date 6/6/2026
 * @since 1.0.0
 */
export class JsPostfixOp extends JsExpr {
    private readonly op: SynTokenNode;
    private readonly operand: JsExpr;

    public constructor(node: ASTNode) {
        super(node);

        this.operand = this.getNthChildOfType(JsExpr, 0)!;
        this.op = this.getAllToken()[0];
    }

    getOp(): SynTokenNode {
        return this.op;
    }

    getOperand(): JsExpr {
        return this.operand;
    }

    toDebugString(): string {
        return `(${this.operand.toDebugString()} ${this.op.getValue()})`;
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitPostfixOp(this);
        }

        super.accept(visitor);
    }
}
