import {JsSynVisitor} from "../syntax/visitors/JsSynVisitor";
import {SynNode} from "../../../../core/lang/syntax/api/SynNode";
import {JsExpr} from "../syntax/expr/JsExpr";
import {JsGroupExpr} from "../syntax/expr/JsGroupExpr";
import {JsArrayAccessExpr} from "../syntax/expr/JsArrayAccessExpr";
import {JsAssignmentExpr} from "../syntax/expr/JsAssignmentExpr";
import {JsBinaryExpr} from "../syntax/expr/JsBinaryExpr";
import {JsTernaryExpr} from "../syntax/expr/JsTernaryExpr";
import {JsNewExpr} from "../syntax/expr/JsNewExpr";
import {JsCallExpr} from "../syntax/expr/JsCallExpr";
import {JsMemberAccessExpr} from "../syntax/expr/JsMemberAccessExpr";
import {JsSpreadExpr} from "../syntax/expr/JsSpreadExpr";
import {JsPostfixOp} from "../syntax/expr/JsPostfixOp";
import {JsPrefixOp} from "../syntax/expr/JsPrefixOp";
import {JsLiteral} from "../syntax/literal/JsLiteral";
import {JsIdentifier} from "../syntax/literal/JsIdentifier";
import {JsNumberLiteral} from "../syntax/literal/JsNumberLiteral";
import {JsStringLiteral} from "../syntax/literal/JsStringLiteral";
import {JsBooleanLiteral} from "../syntax/literal/JsBooleanLiteral";
import {JsNullLiteral} from "../syntax/literal/JsNullLiteral";
import {JsUndefinedLiteral} from "../syntax/literal/JsUndefinedLiteral";
import {JsArrayLiteral} from "../syntax/literal/JsArrayLiteral";
import {SynASTElement} from "../../../../core/lang/syntax/api/tree/SynASTElement";
import {JsDeclarator} from "../syntax/statements/JsDeclarator";
import {JsReturnStatement} from "../syntax/statements/JsReturnStatement";
import {JsBreakStatement} from "../syntax/statements/JsBreakStatement";
import {JsSwitchCase, JsSwitchStatement} from "../syntax/statements/JsSwitchStatement";
import {JsEmptyStatement} from "../syntax/statements/JsEmptyStatement";
import {SynFile} from "../../../../core/lang/syntax/api/filesystem/SynFile";
import {AbstractSynTemplate} from "../../../../core/lang/syntax/writer/template/AbstractSynTemplate";
import {SynTokenNode} from "../../../../core/lang/syntax/impl/SynTokenNode";
import {SynErrorNode} from "../../../../core/lang/syntax/impl/SynErrorNode";
import {JsVariableDeclaration} from "../syntax/statements/JsVariableDeclaration";
import {JsCodeBlock} from "../syntax/JsCodeBlock";
import {SynPrinter} from "../../../../core/lang/syntax/writer/SynPrinter";
import {JsWhileStatement} from "../syntax/statements/JsWhileStatement";
import {JsDoWhileStatement} from "../syntax/statements/JsDoWhileStatement";
import {JsForOfStatement} from "../syntax/statements/JsForOfStatement";
import {JsForInStatement} from "../syntax/statements/JsForInStatement";
import {JsForIStatement} from "../syntax/statements/JsForIStatement";
import {JsStatement} from "../syntax/statements/JsStatement";
import {JsIfStatement} from "../syntax/statements/JsIfStatement";
import {SynTree} from "../../../../core/lang/syntax/api/tree/SynTree";

/**
 *
 * @author Atzitz Amos
 * @date 6/6/2026
 * @since 1.0.0
 */
export class JsPrinter extends JsSynVisitor implements SynPrinter {
    private out = "";
    private line = "";
    private indentLevel = 0;

    print(node: SynNode): string {
        this.out = "";
        this.line = "";
        this.indentLevel = 0;
        this.visitNext(node);
        if (this.line.trim() !== "") {
            this.out += "    ".repeat(this.indentLevel) + this.line;
        }
        return this.out;
    }

    visitExpr(element: JsExpr) {
        super.visitExpr(element);
    }

    visitGroupExpr(element: JsGroupExpr) {
        this.write("(");
        this.visitNext(element.getExpr());
        this.write(")");
    }

    visitArrayAccessExpr(element: JsArrayAccessExpr) {
        this.visitNext(element.getArrayName());
        this.write("[");
        this.visitNext(element.getIndex());
        this.write("]");
    }

    visitAssignmentExpr(element: JsAssignmentExpr) {
        this.visitNext(element.getLeft());
        this.write(" = ");
        this.visitNext(element.getRight());
    }

    visitBinaryExpr(element: JsBinaryExpr) {
        this.visitNext(element.getLeft());
        this.write(` ${element.getOperator().getValue()} `);
        this.visitNext(element.getRight());
    }

    visitTernaryExpr(element: JsTernaryExpr) {
        this.visitNext(element.getCondition());
        this.write(" ? ");
        this.visitNext(element.getTrueExpr());
        this.write(" : ");
        this.visitNext(element.getFalseExpr());
    }

    visitNewExpr(element: JsNewExpr) {
        this.write("new ");
        this.visitNext(element.getCallee());
        this.write("(");
        element.getArguments().forEach((arg, index) => {
            if (index > 0) {
                this.write(", ");
            }
            this.visitNext(arg);
        });
        this.write(")");
    }

    visitCallExpr(element: JsCallExpr) {
        this.visitNext(element.getCallee());
        this.write("(");
        element.getArguments().forEach((arg, index) => {
            if (index > 0) {
                this.write(", ");
            }
            this.visitNext(arg);
        });
        this.write(")");
    }

    visitMemberAccessExpr(element: JsMemberAccessExpr) {
        this.visitNext(element.getObject());
        this.write(element.isOptionalChaining() ? "?." : ".");
        this.write(element.getProperty().getValue());
    }

    visitSpreadExpr(element: JsSpreadExpr) {
        this.write("...");
        this.visitNext(element.getExpr());
    }

    visitPostfixOp(element: JsPostfixOp) {
        this.visitNext(element.getOperand());
        this.write(element.getOp().getValue());
    }

    visitPrefixOp(element: JsPrefixOp) {
        this.write(element.getOp().getValue());
        this.visitNext(element.getOperand());
    }

    visitLiteral(element: JsLiteral) {
        this.write(element.getValue());
    }

    visitIdentifier(element: JsIdentifier) {
        this.write(element.getName());
    }

    visitNumberLiteral(element: JsNumberLiteral) {
        super.visitNumberLiteral(element);
    }

    visitStringLiteral(element: JsStringLiteral) {
        super.visitStringLiteral(element);
    }

    visitBooleanLiteral(element: JsBooleanLiteral) {
        super.visitBooleanLiteral(element);
    }

    visitNullLiteral(element: JsNullLiteral) {
        super.visitNullLiteral(element);
    }

    visitUndefinedLiteral(element: JsUndefinedLiteral) {
        super.visitUndefinedLiteral(element);
    }

    visitArrayLiteral(element: JsArrayLiteral) {
        this.write("[");
        element.getElements().forEach((el, index) => {
            if (index > 0) {
                this.write(", ");
            }
            this.visitNext(el);
        });
        this.write("]");
    }

    visitStatement(element: JsStatement) {
        super.visitStatement(element);
    }

    visitDeclarator(element: JsDeclarator) {
        let nameNode = element.getNameNode();
        if (nameNode instanceof SynTokenNode) this.write(nameNode.getValue());
        else this.visitNext(nameNode);
        if (element.isInitialized()) {
            this.write(" = ");
            this.visitNext(element.getExpression()!);
        }
    }

    visitReturnStatement(element: JsReturnStatement) {
        this.write("return");
        if (element.getExpr() !== null) {
            this.write(" ");
            this.visitNext(element.getExpr()!);
        }
    }

    visitBreakStatement(element: JsBreakStatement) {
        this.write("break");
        if (element.getLabel() !== null) {
            this.write(" " + element.getLabel()!.getValue());
        }
    }

    visitSwitchStatement(element: JsSwitchStatement) {
        this.write("switch (");
        this.visitNext(element.getExpr());
        this.write(") {");
        this.newline();

        const old = this.indentLevel;
        this.indent();
        this.indent();
        element.getBody().getChildren().forEach(item => {
            if (item instanceof SynTokenNode) {
                if (item.token.isCommentToken()) {
                    this.visitNext(item);
                    this.newline();
                }
            } else if (item instanceof JsSwitchCase) {
                this.dedent();          // case labels are at block level, not indented
                this.visitNext(item);
                this.newline();
                this.indent();
            } else {
                this.visitNext(item);
                this.write(";");
                this.newline();
            }
        });

        this.indentLevel = old;

        this.write("}");
    }

    visitIfStatement(element: JsIfStatement) {
        // TODO
    }

    visitSwitchCaseClause(element: JsSwitchCase) {
        if (element.isDefault()) {
            this.write("default:");
        } else {
            this.write("case ");
            this.visitNext(element.getCaseExpr()!);
            this.write(":");
        }
    }

    visitWhileStatement(element: JsWhileStatement) {
        this.write("while (");
        this.visitNext(element.getExpr());
        this.write(") ");
        this.visitNext(element.getBody());
    }

    visitDoWhileStatement(element: JsDoWhileStatement) {
        this.write("do ");
        this.visitNext(element.getBody());
        this.write(" while (");
        this.visitNext(element.getExpr());
        this.write(")");
    }

    visitForOfStatement(element: JsForOfStatement) {
        this.write("for (");
        this.visitNext(element.getDeclarator());
        this.write(" of ");
        this.visitNext(element.getExpr());
        this.write(") ");
        this.visitNext(element.getBody());
    }

    visitForInStatement(element: JsForInStatement) {
        this.write("for (");
        this.visitNext(element.getDeclarator());
        this.write(" in ");
        this.visitNext(element.getExpr());
        this.write(") ");
        this.visitNext(element.getBody());
    }

    visitForIStatement(element: JsForIStatement) {
        this.write("for (");
        if (element.getDeclarator() !== null) {
            this.visitNext(element.getDeclarator()!);
        }
        this.write("; ");
        if (element.getCondition() !== null) {
            this.visitNext(element.getCondition()!);
        }
        this.write("; ");
        if (element.getIncrement() !== null) {
            this.visitNext(element.getIncrement()!);
        }
        this.write(") ");
        this.visitNext(element.getBody());
    }

    visitEmptyStatement(element: JsEmptyStatement) {
    }

    visitVariableDeclaration(element: JsVariableDeclaration) {
        this.write(element.getKindToken().getValue());
        this.write(" ");
        element.getDeclarations().forEach((decl, index) => {
            if (index > 0) {
                this.write(", ");
            }
            this.visitNext(decl);
        });
    }

    visitCodeBlock(element: JsCodeBlock) {
        this.write("{");
        this.newline();

        const prevIndent = this.indentLevel;
        this.indent();
        element.getChildren().forEach(stmt => {
            if (stmt instanceof SynTokenNode) {
                if (stmt.token.isCommentToken()) {
                    this.visitNext(stmt);
                    this.newline();
                }
            } else {
                this.visitNext(stmt);
                this.write(";");
                this.newline();
            }
        });

        this.indentLevel = prevIndent;

        this.write("}");
        this.newline();
    }

    visitNode(node: SynNode) {
        super.visitNode(node);
    }

    visitFile(file: SynFile) {
        this.visitTree(file.getSynDocument().getTree())
    }

    visitTree(tree: SynTree) {
        for (const child of tree.getChildren()) {
            this.visitNext(child);
            this.newline();
        }
    }

    visitTemplate(template: AbstractSynTemplate) {
        const text = template.getText();
        text.split("\n").forEach((line, index) => {
            if (index > 0)
                this.newline();
            this.write(line);
        });
    }

    visitElement(element: SynASTElement) {
        super.visitElement(element);
    }

    visitToken(token: SynTokenNode) {
        if (token.token.isCommentToken()) {
            token.getValue().split("\n").forEach((line, index) => {
                if (index > 0)
                    this.newline();
                this.write(line);
            });
        }
    }

    visitError(error: SynErrorNode) {
        throw new Error(`Cannot print a node that contains errors`);
    }

    public visitNext(node: SynNode) {
        node.accept(this);
    }

    private write(str: string) {
        this.line += str;
    }

    private newline() {
        this.out += "    ".repeat(this.indentLevel) + this.line + "\n";
        this.line = "";
    }

    private indent() {
        this.indentLevel++;
    }

    private dedent() {
        this.indentLevel = Math.max(0, this.indentLevel - 1);
    }
}