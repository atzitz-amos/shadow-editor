import {ASTNode} from "../../../../../lang/syntax/builder/parser/nodes/ASTNode";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";
import {JsExpr} from "./JsExpr";
import {JsArgumentList} from "./JsArgumentList";

/**
 *
 * @author Atzitz Amos
 * @date 11/27/2025
 * @since 1.0.0
 */
export class JsNewExpr extends JsExpr {
    private readonly callee: JsExpr;
    private readonly argumentList: JsArgumentList;

    constructor(node: ASTNode) {
        super(node);
        this.callee = this.getNthChild(1) as JsExpr;
        this.argumentList = this.getNthChildOfType(JsArgumentList, 0)!
    }

    getCallee(): JsExpr {
        return this.callee;
    }

    getArgumentList(): JsArgumentList {
        return this.argumentList;
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitNewExpr(this);
        }

        super.accept(visitor);
    }
}
