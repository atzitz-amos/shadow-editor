import {ASTNode} from "../../../../../core/lang/syntax/builder/parser/nodes/ASTNode";
import {SynNodeVisitor} from "../../../../../core/lang/syntax/utils/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";
import {JsExpr} from "./JsExpr";
import {SynTokenNode} from "../../../../../core/lang/syntax/impl/SynTokenNode";
import {JsArrayLiteral} from "../literal/JsArrayLiteral";
import {JsIdentifier} from "../literal/JsIdentifier";

/**
 *
 * @author Atzitz Amos
 * @date 11/27/2025
 * @since 1.0.0
 */
export class JsAssignmentExpr extends JsExpr {
    private readonly operator: SynTokenNode;
    private readonly left: JsExpr;
    private readonly right: JsExpr;

    constructor(node: ASTNode) {
        super(node);

        this.left = this.getNthChild(0) as JsExpr;
        this.operator = this.getNthChild(1) as SynTokenNode;
        this.right = this.getNthChild(2) as JsExpr;
    }

    getOperator(): SynTokenNode {
        return this.operator;
    }

    getLeft(): JsExpr {
        return this.left;
    }

    getRight(): JsExpr {
        return this.right;
    }

    public toDebugString(): string {
        return `(${this.left.toDebugString()} ${this.operator.getValue()} ${this.right.toDebugString()})`;
    }

    getAllModifiedIdentifiers(): JsIdentifier[] {
        let result: JsIdentifier[] = []
        if (this.left instanceof JsArrayLiteral) {
            for (let element of this.left.childrenIterator(e => e instanceof JsIdentifier)) {
                result.push(element as JsIdentifier);
            }
        } else if (this.left instanceof JsIdentifier) {
            return [this.left];
        }
        return result;
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitAssignmentExpr(this);
        }

        super.accept(visitor);
    }
}

