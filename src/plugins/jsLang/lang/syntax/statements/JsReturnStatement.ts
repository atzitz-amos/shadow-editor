import {SynElementImpl} from "../../../../../core/lang/syntax/impl/SynElementImpl";
import {ASTNode} from "../../../../../core/lang/syntax/builder/parser/nodes/ASTNode";
import {SynNodeVisitor} from "../../../../../core/lang/syntax/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";
import {JsExpr} from "../expr/JsExpr";
import {JsStatement} from "./JsStatement";

/**
 *
 * @author Atzitz Amos
 * @date 6/2/2026
 * @since 1.0.0
 */
export class JsReturnStatement extends JsStatement {
    private readonly expr: JsExpr | null;

    constructor(node: ASTNode) {
        super(node);

        this.expr = this.findNthChildOfType(JsExpr, 0) || null;
    }

    getExpr(): JsExpr| null {
        return this.expr;
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitReturnStatement(this);
        } else {
            super.accept(visitor);
        }
    }
}
