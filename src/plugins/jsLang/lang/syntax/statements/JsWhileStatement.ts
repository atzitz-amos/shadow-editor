import {JsStatement} from "./JsStatement";
import {JsExpr} from "../expr/JsExpr";
import {JsCodeBlock} from "../JsCodeBlock";
import {ASTNode} from "../../../../../core/lang/syntax/builder/parser/nodes/ASTNode";
import {SynNodeVisitor} from "../../../../../core/lang/syntax/utils/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";

/**
 *
 * @author Atzitz Amos
 * @date 6/13/2026
 * @since 1.0.0
 */
export class JsWhileStatement extends JsStatement {
    private readonly expr: JsExpr;
    private readonly body: JsCodeBlock;

    constructor(node: ASTNode) {
        super(node);

        this.expr = this.getNthChildOfType(JsExpr, 0)!;
        this.body = this.getNthChildOfType(JsCodeBlock, 0)!;
    }

    getExpr() {
        return this.expr;
    }

    getBody() {
        return this.body;
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitWhileStatement(this);
        }

        super.accept(visitor);
    }
}
