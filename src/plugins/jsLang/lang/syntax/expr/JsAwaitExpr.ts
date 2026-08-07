import {JsExpr} from "./JsExpr";
import {ASTNode} from "../../../../../lang/syntax/builder/parser/nodes/ASTNode";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";
import {SynTokenNode} from "../../../../../lang/syntax/impl/SynTokenNode";

/**
 *
 * @author Atzitz Amos
 * @date 8/5/2026
 * @since 1.0.0
 */
export class JsAwaitExpr extends JsExpr {
    private readonly awaitToken: SynTokenNode;
    private readonly expression: JsExpr;

    constructor(node: ASTNode) {
        super(node);

        this.awaitToken = this.getNthChild(0) as SynTokenNode;
        this.expression = this.getNthChildOfType(JsExpr, 0)!;
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitAwaitExpr(this);
        }

        super.accept(visitor);
    }

    getAwaitToken() {
        return this.awaitToken;
    }

    getExpr() {
        return this.expression;
    }
}
