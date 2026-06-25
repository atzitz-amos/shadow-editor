import {ASTGrammar} from "../../../../core/lang/syntax/builder/parser/nodes/ASTGrammar";
import {JsCodeBlock} from "../syntax/JsCodeBlock";
import {JsBinaryExpr} from "../syntax/expr/JsBinaryExpr";
import {JsTernaryExpr} from "../syntax/expr/JsTernaryExpr";
import {JsAssignmentExpr} from "../syntax/expr/JsAssignmentExpr";
import {JsMemberAccessExpr} from "../syntax/expr/JsMemberAccessExpr";
import {JsCallExpr} from "../syntax/expr/JsCallExpr";
import {JsArrayAccessExpr} from "../syntax/expr/JsArrayAccessExpr";
import {JsNewExpr} from "../syntax/expr/JsNewExpr";
import {JsIdentifier} from "../syntax/literal/JsIdentifier";
import {JsDeclarator} from "../syntax/statements/JsDeclarator";
import {JsArrayLiteral} from "../syntax/literal/JsArrayLiteral";
import {JsNumberLiteral} from "../syntax/literal/JsNumberLiteral";
import {JsStringLiteral} from "../syntax/literal/JsStringLiteral";
import {JsBooleanLiteral} from "../syntax/literal/JsBooleanLiteral";
import {JsNullLiteral} from "../syntax/literal/JsNullLiteral";
import {JsUndefinedLiteral} from "../syntax/literal/JsUndefinedLiteral";
import {JsReturnStatement} from "../syntax/statements/JsReturnStatement";
import {JsSwitchCase, JsSwitchStatement} from "../syntax/statements/JsSwitchStatement";
import {JsBreakStatement} from "../syntax/statements/JsBreakStatement";
import {JsFunction} from "../syntax/statements/JsFunction";
import {JsLiteral} from "../syntax/literal/JsLiteral";
import {JsExpr} from "../syntax/expr/JsExpr";
import {JsSpreadExpr} from "../syntax/expr/JsSpreadExpr";
import {JsFunctionParameters} from "../syntax/statements/JsFunctionParameters";
import {JsVariableDeclaration} from "../syntax/statements/JsVariableDeclaration";
import {JsEmptyStatement} from "../syntax/statements/JsEmptyStatement";
import {JsPrefixOp} from "../syntax/expr/JsPrefixOp";
import {JsPostfixOp} from "../syntax/expr/JsPostfixOp";
import {JsGroupExpr} from "../syntax/expr/JsGroupExpr";
import {JsDoWhileStatement} from "../syntax/statements/JsDoWhileStatement";
import {JsForInStatement} from "../syntax/statements/JsForInStatement";
import {JsForIStatement} from "../syntax/statements/JsForIStatement";
import {JsWhileStatement} from "../syntax/statements/JsWhileStatement";
import {JsForOfStatement} from "../syntax/statements/JsForOfStatement";
import {JsIfStatement} from "../syntax/statements/JsIfStatement";

export class JsGrammar {
    public static readonly CodeBlock = ASTGrammar.createCodeBlock("CodeBlock", JsCodeBlock.builder());
    public static readonly EmptyStatement = ASTGrammar.create("EmptyStatement", JsEmptyStatement.builder());
    public static readonly IfStatement = ASTGrammar.create("IfStatement", JsIfStatement.builder());
    public static readonly IfClause = ASTGrammar.create("IfClause");
    public static readonly ElseClause = ASTGrammar.create("ElseIfClause");
    public static readonly ForInStatement = ASTGrammar.create("ForInStatement", JsForInStatement.builder());
    public static readonly ForOfStatement = ASTGrammar.create("ForOfStatement", JsForOfStatement.builder());
    public static readonly ForIStatement = ASTGrammar.create("ForIStatement", JsForIStatement.builder());
    public static readonly WhileStatement = ASTGrammar.create("WhileStatement", JsWhileStatement.builder());
    public static readonly DoWhileStatement = ASTGrammar.create("DoWhileStatement", JsDoWhileStatement.builder());
    public static readonly SwitchStatement = ASTGrammar.create("SwitchStatement", JsSwitchStatement.builder());
    public static readonly SwitchCaseClause = ASTGrammar.create("SwitchCaseClause", JsSwitchCase.builder());
    public static readonly SwitchDefaultClause = ASTGrammar.create("SwitchDefaultClause", JsSwitchCase.builder());
    public static readonly TryCatchStatement = ASTGrammar.create("TryCatchStatement");
    public static readonly TryClause = ASTGrammar.create("TryClause");
    public static readonly CatchClause = ASTGrammar.create("CatchClause");
    public static readonly FinallyClause = ASTGrammar.create("FinallyClause");

    public static readonly ReturnStatement = ASTGrammar.create("ReturnStatement", JsReturnStatement.builder());
    public static readonly BreakStatement = ASTGrammar.create("BreakStatement", JsBreakStatement.builder());
    public static readonly ContinueStatement = ASTGrammar.create("ContinueStatement");
    public static readonly ThrowStatement = ASTGrammar.create("ThrowStatement");
    public static readonly YieldStatement = ASTGrammar.create("YieldStatement");
    public static readonly AwaitStatement = ASTGrammar.create("AwaitStatement");
    public static readonly DebuggerStatement = ASTGrammar.create("DebuggerStatement");

    public static readonly FunctionDeclaration = ASTGrammar.create("FunctionDeclaration", JsFunction.builder());
    public static readonly FunctionArguments = ASTGrammar.create("FunctionArguments", JsFunctionParameters.builder());
    public static readonly FunctionArgument = ASTGrammar.create("FunctionArgument");
    public static readonly ClassDeclaration = ASTGrammar.create("ClassDeclaration");
    public static readonly ClassBody = ASTGrammar.createCodeBlock("ClassBody", JsCodeBlock.builder());
    public static readonly ClassMethodDeclaration = ASTGrammar.create("ClassMethod");
    public static readonly ClassField = ASTGrammar.create("ClassField");

    public static readonly VariableDeclaration = ASTGrammar.create("VariableDeclaration", JsVariableDeclaration.builder());
    public static readonly VariableDeclarator = ASTGrammar.create("VariableDeclarator", JsDeclarator.builder());

    /* EXPRESSIONS */
    public static readonly NumberLiteral = ASTGrammar.create("NumberLiteral", JsNumberLiteral.builder());
    public static readonly StringLiteral = ASTGrammar.create("StringLiteral", JsStringLiteral.builder());
    public static readonly BooleanLiteral = ASTGrammar.create("BooleanLiteral", JsBooleanLiteral.builder());
    public static readonly NullLiteral = ASTGrammar.create("NullLiteral", JsNullLiteral.builder());
    public static readonly UndefinedLiteral = ASTGrammar.create("UndefinedLiteral", JsUndefinedLiteral.builder());
    public static readonly Identifier = ASTGrammar.create("Identifier", JsIdentifier.builder());
    public static readonly ThisExpr = ASTGrammar.create("ThisExpression", JsLiteral.builder());
    public static readonly ArrayLiteral = ASTGrammar.create("ArrayLiteral", JsArrayLiteral.builder());
    public static readonly ObjectLiteral = ASTGrammar.create("ObjectLiteral", JsLiteral.builder());
    public static readonly TemplateLiteral = ASTGrammar.create("TemplateLiteral", JsLiteral.builder());
    public static readonly RegexLiteral = ASTGrammar.create("RegexLiteral", JsLiteral.builder());

    public static readonly PrefixOperator = ASTGrammar.create("PrefixOp", JsPrefixOp.builder());
    public static readonly PostfixOperator = ASTGrammar.create("PostfixOp", JsPostfixOp.builder());
    public static readonly BinaryExpr = ASTGrammar.create("BinaryOp", JsBinaryExpr.builder());
    public static readonly TernaryExpr = ASTGrammar.create("TernaryOp", JsTernaryExpr.builder());
    public static readonly AssignmentExpr = ASTGrammar.create("AssignmentOp", JsAssignmentExpr.builder());

    public static readonly MemberAccessExpr = ASTGrammar.create("MemberAccessExpr", JsMemberAccessExpr.builder());
    public static readonly ArrayAccessExpr = ASTGrammar.create("ArrayAccessExpr", JsArrayAccessExpr.builder());
    public static readonly CallExpr = ASTGrammar.create("CallExpr", JsCallExpr.builder());
    public static readonly NewExpr = ASTGrammar.create("NewExpr", JsNewExpr.builder());
    public static readonly SpreadExpr = ASTGrammar.create("SpreadExpr", JsSpreadExpr.builder());
    public static readonly GroupExpr = ASTGrammar.create("GroupExpr", JsGroupExpr.builder());

    public static readonly ClassExpression = ASTGrammar.create("ClassExpression", JsExpr.builder());
    public static readonly FunctionExpression = ASTGrammar.create("FunctionExpression", JsExpr.builder());
    public static readonly ArrowFunctionExpression = ASTGrammar.create("ArrowFunctionExpression", JsExpr.builder());


    public static readonly CommaExpr = ASTGrammar.create("CommaExpr", JsExpr.builder());
    public static readonly EmptyCommaExpr = ASTGrammar.create("EmptyCommaExpr", JsExpr.builder());

    public static readonly DestructuringListPattern = ASTGrammar.create("DestructuringListPattern", JsExpr.builder());
    public static readonly DestructuringObjectPattern = ASTGrammar.create("DestructuringObjectPattern", JsExpr.builder());
    public static readonly ObjectPropertyKey = ASTGrammar.create("ObjectPropertyKey");
    public static readonly ObjectPropertyValue = ASTGrammar.create("ObjectPropertyValue");
    public static readonly ObjectPropertyShorthand = ASTGrammar.create("ObjectPropertyShorthand");
}
