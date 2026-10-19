import {JsStatement} from "./JsStatement";
import {ASTNode} from "../../../../../lang/syntax/builder/parser/nodes/ASTNode";
import {SynASTElementImpl} from "../../../../../lang/syntax/impl/tree/SynASTElementImpl";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";
import {JsCodeBlock} from "../JsCodeBlock";
import {JsExpr} from "../expr/JsExpr";

export class JsIfClause extends SynASTElementImpl {

    constructor(node: ASTNode) {
        super(node);
    }

    getBody(): JsCodeBlock {
        return this.getNthChildOfType(JsCodeBlock, 0)!;
    }

    getCondition(): JsExpr {
        return this.getNthChildOfType(JsExpr, 0)!;
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitIfClause(this);
        }
        super.accept(visitor);
    }
}

export class JsElseClause extends SynASTElementImpl {

    constructor(node: ASTNode) {
        super(node);
    }

    getBody(): JsCodeBlock {
        return this.getNthChildOfType(JsCodeBlock, 0)!;
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitElseClause(this);
        }
        super.accept(visitor);
    }
}

/**
 *
 * @author Atzitz Amos
 * @date 6/13/2026
 * @since 1.0.0
 */
export class JsIfStatement extends JsStatement {
    private readonly clauses: JsIfClause[];
    private readonly elseClause: JsElseClause | null;

    constructor(node: ASTNode) {
        super(node);

        this.clauses = this.getAllChildrenOfType(JsIfClause);
        this.elseClause = this.getNthChildOfType(JsElseClause, 0) ?? null;
    }

    getClauses(): JsIfClause[] {
        return this.clauses;
    }

    getElseClause(): JsElseClause | null {
        return this.elseClause;
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitIfStatement(this);
        }
        super.accept(visitor);
    }
}
