import {SynASTElementImpl} from "../../../../../core/lang/syntax/impl/tree/SynASTElementImpl";
import {ASTNode} from "../../../../../core/lang/syntax/builder/parser/nodes/ASTNode";
import {SynTokenNode} from "../../../../../core/lang/syntax/impl/SynTokenNode";
import {SynNode} from "../../../../../core/lang/syntax/api/SynNode";
import {JsCodeBlock} from "../JsCodeBlock";
import {SynNodeVisitor} from "../../../../../core/lang/syntax/utils/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";
import {JsStatement} from "./JsStatement";

/**
 *
 * @author Atzitz Amos
 * @date 6/2/2026
 * @since 1.0.0
 */
export class JsSwitchCase extends JsStatement {
    private readonly expr: SynNode | null;

    constructor(public node: ASTNode) {
        super(node);

        if ((<SynTokenNode>node.children[0]).token.getValue() === "case") {
            this.expr = node.children[1];
        } else {
            this.expr = null;
        }
    }

    isDefault(): boolean {
        return this.expr === null;
    }

    getCaseExpr(): SynNode | null {
        return this.expr;
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitSwitchCaseClause(this);
        }

        super.accept(visitor);
    }
}

export class JsSwitchStatement extends SynASTElementImpl {
    private readonly cases: JsSwitchCase[];

    private readonly expr: SynNode;
    private readonly body: JsCodeBlock;

    constructor(node: ASTNode) {
        super(node);

        // 'switch' '(' expr ')' body
        this.expr = node.children[2];
        this.body = this.getAllChildrenOfType(JsCodeBlock)[0];
        this.cases = this.body.getAllChildrenOfType(JsSwitchCase);
    }

    getExpr(): SynNode {
        return this.expr;
    }

    getBody(): JsCodeBlock {
        return this.body;
    }

    getCases(): JsSwitchCase[] {
        return this.cases;
    }

    /**
     * Returns the cases in the body, split by case statements.
     * The first element of the result is the statements before the first case statement, which should be empty in a valid switch statement
     */
    getCaseBodies(): SynNode[][] {
        let result: SynNode[][] = [];
        let current: SynNode[] = [];
        for (const child of this.body.getChildren()) {
            if (child instanceof JsSwitchCase) {
                result.push(current);
                current = [];
            } else
                current.push(child);
        }

        result.push(current);

        return result;
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitSwitchStatement(this);
        }

        super.accept(visitor);
    }
}
