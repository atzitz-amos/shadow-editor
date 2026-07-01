import {ASTNode} from "../../../../../core/lang/syntax/builder/parser/nodes/ASTNode";
import {SynNodeVisitor} from "../../../../../core/lang/syntax/utils/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";
import {JsExpr} from "../expr/JsExpr";

/**
 *
 * @author Atzitz Amos
 * @date 6/1/2026
 * @since 1.0.0
 */
export class JsArrayLiteral extends JsExpr {
    private readonly elements: JsExpr[];

    constructor(node: ASTNode) {
        super(node);

        this.elements = this.getAllChildrenOfType(JsExpr);
    }

    getElements(): JsExpr[] {
        return this.elements;
    }

    public toDebugString(): string {
        return `([${this.elements.map(element => element.toDebugString()).join(", ")}])`;
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitArrayLiteral(this);
        }
    }
}
