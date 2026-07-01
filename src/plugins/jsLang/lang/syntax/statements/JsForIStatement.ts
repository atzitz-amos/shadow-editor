import {JsStatement} from "./JsStatement";
import {JsIdentifier} from "../literal/JsIdentifier";
import {JsVariableDeclaration} from "./JsVariableDeclaration";
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
export class JsForIStatement extends JsStatement {
    private readonly declarator: JsIdentifier | JsVariableDeclaration | null;
    private readonly cond: JsExpr | null;
    private readonly incr: JsExpr | null;
    private readonly body: JsCodeBlock;

    constructor(node: ASTNode) {
        super(node);

        this.declarator = this.getElementChildren()[0] as JsIdentifier | JsVariableDeclaration;

        let base = this.declarator instanceof JsVariableDeclaration ? 0 : 1;

        this.cond = this.getNthChildOfType(JsExpr, base) ?? null;
        this.incr = this.getNthChildOfType(JsExpr, base + 1) ?? null;
        this.body = this.getNthChildOfType(JsCodeBlock, 0)!;
    }

    getDeclarator() {
        return this.declarator;
    }

    getCondition() {
        return this.cond;
    }

    getIncrement() {
        return this.incr;
    }

    getBody() {
        return this.body;
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitForIStatement(this);
        }

        super.accept(visitor);
    }
}
