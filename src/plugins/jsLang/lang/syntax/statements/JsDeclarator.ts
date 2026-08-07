import {SynDeclaration} from "../../../../../lang/syntax/impl/reference/SynDeclaration";
import {ASTNode} from "../../../../../lang/syntax/builder/parser/nodes/ASTNode";
import {SynTokenNode} from "../../../../../lang/syntax/impl/SynTokenNode";
import {SynErrorNode} from "../../../../../lang/syntax/impl/SynErrorNode";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";
import {JsExpr} from "../expr/JsExpr";
import {JsVariableDeclaration} from "./JsVariableDeclaration";
import {SynNode} from "../../../../../lang/syntax/api/SynNode";
import {JsLexicalGrammar} from "../../lexer/JsLexicalGrammar";
import {JsArrayDestructuringPatternExpr} from "../expr/JsArrayDestructuringPatternExpr";

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

        this.name = this.getNthChild(0) as SynTokenNode | SynErrorNode;

        const eqToken = this.getNthChild(1);
        if (eqToken instanceof SynTokenNode) {
            this.equToken = eqToken;
            this.expr = this.getNthChild(2) as JsExpr;
        } else {
            this.equToken = null;
            this.expr = null;
        }
    }

    getAllModifiedIdentifiers(): SynTokenNode[] {
        return this.getAllModifiedIdentifiersRecursively(this.name);
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

    getNameNode(): JsExpr | SynTokenNode | SynErrorNode {
        return this.name;
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
        }

        super.accept(visitor);
    }

    isConst() {
        return (this.getParent() as JsVariableDeclaration).isConst();
    }

    private getAllModifiedIdentifiersRecursively(element: SynNode): SynTokenNode[] {
        let result: SynTokenNode[] = [];
        if (element instanceof SynTokenNode && element.token.isType(JsLexicalGrammar.IDENTIFIER)) {
            result.push(element);
        } else if (element instanceof JsArrayDestructuringPatternExpr) {
        }
        return result;
    }
}
