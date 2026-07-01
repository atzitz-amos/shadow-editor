import {ASTNode} from "../../../../../core/lang/syntax/builder/parser/nodes/ASTNode";
import {JsExpr} from "./JsExpr";
import {SynNodeVisitor} from "../../../../../core/lang/syntax/utils/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";

/**
 *
 * @author Atzitz Amos
 * @date 11/27/2025
 * @since 1.0.0
 */
export class JsArrayAccessExpr extends JsExpr {
    private readonly array: JsExpr;
    private readonly index: JsExpr;

    constructor(node: ASTNode) {
        super(node);
        this.array = this.getNthChildOfType(JsExpr, 0)!;
        this.index = this.getNthChildOfType(JsExpr, 1)!;
    }

    getArrayName(): JsExpr {
        return this.array;
    }

    getIndex(): JsExpr {
        return this.index;
    }

    public toDebugString(): string {
        return `(${this.array.toDebugString()}[${this.index.toDebugString()}])`;
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitArrayAccessExpr(this);
        }

        super.accept(visitor);
    }
}
