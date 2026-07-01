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
export class JsPrefixOp extends JsExpr {
    private readonly op: SynTokenNode;
    private readonly operand: JsExpr;

    public constructor(node: ASTNode) {
        super(node);

        this.op = this.getAllToken()[0];
        this.operand = this.getNthChildOfType(JsExpr, 0)!;
    }

    getOp(): SynTokenNode {
        return this.op;
    }

    getOperand(): JsExpr {
        return this.operand;
    }

    toDebugString(): string {
        return `(${this.op.getValue()} ${this.operand.toDebugString()})`;
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitPrefixOp(this);
        }

        super.accept(visitor);
    }
}
