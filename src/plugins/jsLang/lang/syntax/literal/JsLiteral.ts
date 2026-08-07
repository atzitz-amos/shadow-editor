import {ASTNode} from "../../../../../lang/syntax/builder/parser/nodes/ASTNode";
import {SynTokenNode} from "../../../../../lang/syntax/impl/SynTokenNode";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";
import {JsExpr} from "../expr/JsExpr";

/**
 *
 * @author Atzitz Amos
 * @date 6/1/2026
 * @since 1.0.0
 */
export class JsLiteral extends JsExpr {
    protected readonly value: string;

    constructor(node: ASTNode) {
        super(node);

        this.value = (<SynTokenNode>this.getNthChild(0)).getValue();
    }

    getValue(): string {
        return this.value;
    }

    public toDebugString(): string {
        return `${this.value}`;
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitLiteral(this);
        }

        super.accept(visitor);
    }
}
