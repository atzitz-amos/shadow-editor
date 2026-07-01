import {SynNodeVisitor} from "../../../../../core/lang/syntax/utils/visitors/SynNodeVisitor";
import {JsNewExpr} from "../expr/JsNewExpr";
import {JsArrayAccessExpr} from "../expr/JsArrayAccessExpr";
import {JsAssignmentExpr} from "../expr/JsAssignmentExpr";
import {JsBinaryExpr} from "../expr/JsBinaryExpr";
import {JsIdentifier} from "../literal/JsIdentifier";
import {JsCallExpr} from "../expr/JsCallExpr";
import {JsNumberLiteral} from "../literal/JsNumberLiteral";
import {JsStringLiteral} from "../literal/JsStringLiteral";
import {JsNullLiteral} from "../literal/JsNullLiteral";
import {JsLiteral} from "../literal/JsLiteral";
import {JsUndefinedLiteral} from "../literal/JsUndefinedLiteral";
import {JsArrayLiteral} from "../literal/JsArrayLiteral";
import {JsBooleanLiteral} from "../literal/JsBooleanLiteral";
import {JsTernaryExpr} from "../expr/JsTernaryExpr";
import {JsMemberAccessExpr} from "../expr/JsMemberAccessExpr";
import {JsDeclarator} from "../statements/JsDeclarator";
import {JsSwitchCase, JsSwitchStatement} from "../statements/JsSwitchStatement";
import {JsReturnStatement} from "../statements/JsReturnStatement";
import {JsBreakStatement} from "../statements/JsBreakStatement";
import {JsExpr} from "../expr/JsExpr";
import {JsSpreadExpr} from "../expr/JsSpreadExpr";
import {JsEmptyStatement} from "../statements/JsEmptyStatement";
import {JsPostfixOp} from "../expr/JsPostfixOp";
import {JsPrefixOp} from "../expr/JsPrefixOp";
import {JsGroupExpr} from "../expr/JsGroupExpr";
import {JsVariableDeclaration} from "../statements/JsVariableDeclaration";
import {JsCodeBlock} from "../JsCodeBlock";
import {JsStatement} from "../statements/JsStatement";
import {JsForInStatement} from "../statements/JsForInStatement";
import {JsForIStatement} from "../statements/JsForIStatement";
import {JsForOfStatement} from "../statements/JsForOfStatement";
import {JsWhileStatement} from "../statements/JsWhileStatement";
import {JsDoWhileStatement} from "../statements/JsDoWhileStatement";
import {JsIfStatement} from "../statements/JsIfStatement";

/**
 *
 * @author Atzitz Amos
 * @date 6/1/2026
 * @since 1.0.0
 */
export class JsSynVisitor extends SynNodeVisitor {
    isRecursive(): boolean {
        return false;
    }

    visitExpr(element: JsExpr): void {
        this.visitElement(element);
    }

    visitGroupExpr(element: JsGroupExpr): void {
        this.visitExpr(element);
    }

    visitArrayAccessExpr(element: JsArrayAccessExpr): void {
        this.visitExpr(element);
    }

    visitAssignmentExpr(element: JsAssignmentExpr): void {
        this.visitExpr(element);
    }

    visitBinaryExpr(element: JsBinaryExpr): void {
        this.visitExpr(element);
    }

    visitTernaryExpr(element: JsTernaryExpr): void {
        this.visitExpr(element);
    }

    visitNewExpr(element: JsNewExpr): void {
        this.visitExpr(element);
    }

    visitCallExpr(element: JsCallExpr): void {
        this.visitExpr(element);
    }

    visitMemberAccessExpr(element: JsMemberAccessExpr): void {
        this.visitExpr(element);
    }

    visitSpreadExpr(element: JsSpreadExpr): void {
        this.visitExpr(element);
    }

    visitPostfixOp(element: JsPostfixOp) {
        this.visitExpr(element);
    }

    visitPrefixOp(element: JsPrefixOp) {
        this.visitExpr(element);
    }

    visitLiteral(element: JsLiteral): void {
        this.visitExpr(element);
    }

    visitIdentifier(element: JsIdentifier): void {
        this.visitExpr(element);
    }

    visitNumberLiteral(element: JsNumberLiteral): void {
        this.visitLiteral(element);
    }

    visitStringLiteral(element: JsStringLiteral): void {
        this.visitLiteral(element);
    }

    visitBooleanLiteral(element: JsBooleanLiteral): void {
        this.visitLiteral(element);
    }

    visitNullLiteral(element: JsNullLiteral): void {
        this.visitLiteral(element);
    }

    visitUndefinedLiteral(element: JsUndefinedLiteral): void {
        this.visitLiteral(element);
    }

    visitArrayLiteral(element: JsArrayLiteral): void {
        this.visitExpr(element);
    }

    visitStatement(element: JsStatement): void {
        this.visitElement(element);
    }

    visitDeclarator(element: JsDeclarator): void {
        this.visitElement(element);
    }

    visitReturnStatement(element: JsReturnStatement): void {
        this.visitStatement(element);
    }

    visitBreakStatement(element: JsBreakStatement) {
        this.visitStatement(element);
    }

    visitSwitchStatement(element: JsSwitchStatement): void {
        this.visitStatement(element);
    }

    visitSwitchCaseClause(element: JsSwitchCase): void {
        this.visitNode(element);
    }

    visitVariableDeclaration(element: JsVariableDeclaration) {
        this.visitStatement(element);
    }

    visitForInStatement(element: JsForInStatement) {
        this.visitStatement(element);
    }

    visitForIStatement(element: JsForIStatement) {
        this.visitStatement(element);
    }

    visitForOfStatement(element: JsForOfStatement) {
        this.visitStatement(element);
    }

    visitWhileStatement(element: JsWhileStatement) {
        this.visitStatement(element);
    }

    visitDoWhileStatement(element: JsDoWhileStatement) {
        this.visitStatement(element);
    }

    visitIfStatement(element: JsIfStatement) {
        this.visitStatement(element);
    }

    visitEmptyStatement(element: JsEmptyStatement) {
        this.visitStatement(element);
    }

    visitCodeBlock(element: JsCodeBlock) {

    }
}
