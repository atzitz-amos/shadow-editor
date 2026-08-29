import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
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
import {JsFunction} from "../api/JsFunction";
import {JsFunctionStatement} from "../statements/JsFunctionStatement";
import {JsFunctionExpr} from "../expr/JsFunctionExpr";
import {JsArrowFunctionExpr} from "../expr/JsArrowFunctionExpr";
import {JsAwaitExpr} from "../expr/JsAwaitExpr";
import {JsClassDeclaration} from "../objects/JsClassDeclaration";
import {JsClassExpr} from "../objects/JsClassExpr";
import {JsClassMember} from "../objects/JsClassMember";
import {JsClassField} from "../objects/JsClassField";
import {JsClassMethod} from "../objects/JsClassMethod";
import {JsClass} from "../objects/JsClass";

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
    }

    visitGroupExpr(element: JsGroupExpr): void {
    }

    visitArrayAccessExpr(element: JsArrayAccessExpr): void {
    }

    visitAssignmentExpr(element: JsAssignmentExpr): void {
    }

    visitBinaryExpr(element: JsBinaryExpr): void {
    }

    visitTernaryExpr(element: JsTernaryExpr): void {
    }

    visitNewExpr(element: JsNewExpr): void {
    }

    visitCallExpr(element: JsCallExpr): void {
    }

    visitMemberAccessExpr(element: JsMemberAccessExpr): void {
    }

    visitAwaitExpr(element: JsAwaitExpr): void {
    }

    visitSpreadExpr(element: JsSpreadExpr): void {
    }

    visitPostfixOp(element: JsPostfixOp) {
    }

    visitPrefixOp(element: JsPrefixOp) {
    }

    visitLiteral(element: JsLiteral): void {
    }

    visitIdentifier(element: JsIdentifier): void {
    }

    visitNumberLiteral(element: JsNumberLiteral): void {
    }

    visitStringLiteral(element: JsStringLiteral): void {
    }

    visitBooleanLiteral(element: JsBooleanLiteral): void {
    }

    visitNullLiteral(element: JsNullLiteral): void {
    }

    visitUndefinedLiteral(element: JsUndefinedLiteral): void {
    }

    visitArrayLiteral(element: JsArrayLiteral): void {
    }

    visitStatement(element: JsStatement): void {

    }

    visitClass(element: JsClass): void {

    }

    visitClassDeclaration(element: JsClassDeclaration): void {
    }

    visitClassExpr(element: JsClassExpr): void {
    }

    visitClassMember(element: JsClassMember): void {
    }

    visitClassField(element: JsClassField): void {
    }

    visitClassMethod(element: JsClassMethod): void {
    }

    visitDeclarator(element: JsDeclarator): void {
    }

    visitReturnStatement(element: JsReturnStatement): void {
    }

    visitBreakStatement(element: JsBreakStatement) {
    }

    visitSwitchStatement(element: JsSwitchStatement): void {
    }

    visitSwitchCaseClause(element: JsSwitchCase): void {
    }

    visitVariableDeclaration(element: JsVariableDeclaration) {
    }

    visitForInStatement(element: JsForInStatement) {
    }

    visitForIStatement(element: JsForIStatement) {
    }

    visitForOfStatement(element: JsForOfStatement) {
    }

    visitWhileStatement(element: JsWhileStatement) {
    }

    visitDoWhileStatement(element: JsDoWhileStatement) {
    }

    visitIfStatement(element: JsIfStatement) {
    }

    visitEmptyStatement(element: JsEmptyStatement) {
    }

    visitFunction(element: JsFunction) {
    }

    visitFunctionStatement(element: JsFunctionStatement) {
    }

    visitFunctionExpr(element: JsFunctionExpr) {
    }

    visitArrowFunction(element: JsArrowFunctionExpr) {
    }

    visitJsCodeBlock(element: JsCodeBlock) {
    }
}
