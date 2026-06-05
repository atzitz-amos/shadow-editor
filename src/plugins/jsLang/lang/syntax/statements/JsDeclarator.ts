import {SynDeclaration} from "../../../../../core/lang/syntax/impl/SynDeclaration";
import {ASTNode} from "../../../../../core/lang/syntax/builder/parser/nodes/ASTNode";
import {SynTokenNode} from "../../../../../core/lang/syntax/impl/SynTokenNode";
import {SynErrorNode} from "../../../../../core/lang/syntax/impl/SynErrorNode";
import {SynNodeVisitor} from "../../../../../core/lang/syntax/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";
import {JsExpr} from "../expr/JsExpr";
import {JsVariableDeclaration} from "./JsVariableDeclaration";

/**
 *
 * @author Atzitz Amos
 * @date 12/17/2025
 * @since 1.0.0
 */
export class JsDeclarator extends SynDeclaration {
    private readonly name: JsExpr | SynTokenNode | SynErrorNode;
    private readonly equToken: SynTokenNode | null;
    private readonly expr: JsExpr | null;

    constructor(node: ASTNode) {
        super(node);

        this.name = this.findNthChild(0) as SynTokenNode | SynErrorNode;

        const eqToken = this.findNthChild(1);
        if (eqToken instanceof SynTokenNode) {
            this.equToken = eqToken;
            this.expr = this.findNthChild(2) as JsExpr;
        } else {
            this.equToken = null;
            this.expr = null;
        }
    }

    isInitialized(): boolean {
        return this.expr !== null;
    }

    getName(): string {
        if (this.name instanceof SynErrorNode) {
            return "";
        } else if (this.name instanceof SynTokenNode) {
            return this.name.getValue();
        } else {
            return "";
        }
    }

    getEQToken(): SynTokenNode | null {
        return this.equToken;
    }

    getExpression(): JsExpr | null {
        return this.expr;
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitDeclarator(this);
        } else {
            super.accept(visitor);
        }
    }

    isConst() {
        return (this.getParent() as JsVariableDeclaration).isConst();
    }
}
