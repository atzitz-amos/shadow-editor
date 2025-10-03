import {ASTGrammar} from "../../../../editor/lang/ast/ASTGrammar";

export class JsGrammar {
    public static readonly CodeBlock = ASTGrammar.createCodeBlock("CodeBlock");
    public static readonly IfStatement = ASTGrammar.create("IfStatement");
    public static readonly IfClause = ASTGrammar.create("IfClause");
    public static readonly ElseClause = ASTGrammar.create("ElseIfClause");
    public static readonly ForInStatement = ASTGrammar.create("ForInStatement");
    public static readonly ForOfStatement = ASTGrammar.create("ForOfStatement");
    public static readonly ForIStatement = ASTGrammar.create("ForStatement");
    public static readonly WhileStatement = ASTGrammar.create("WhileStatement");
    public static readonly DoWhileStatement = ASTGrammar.create("DoWhileStatement");
    public static readonly SwitchStatement = ASTGrammar.create("SwitchStatement");
    public static readonly SwitchCaseClause = ASTGrammar.create("SwitchCaseClause");
    public static readonly SwitchDefaultClause = ASTGrammar.create("SwitchDefaultClause");
    public static readonly TryCatchStatement = ASTGrammar.create("TryCatchStatement");
    public static readonly TryClause = ASTGrammar.create("TryClause");
    public static readonly CatchClause = ASTGrammar.create("CatchClause");
    public static readonly FinallyClause = ASTGrammar.create("FinallyClause");

    public static readonly FunctionDeclaration = ASTGrammar.create("FunctionDeclaration");
    public static readonly FunctionArguments = ASTGrammar.create("FunctionArguments");
    public static readonly FunctionArgument = ASTGrammar.create("FunctionArgument");

    /* EXPRESSIONS */
    public static readonly Expression = ASTGrammar.create("Expression");

    public static readonly NumberLiteral = ASTGrammar.create("NumberLiteral");
    public static readonly StringLiteral = ASTGrammar.create("StringLiteral");
    public static readonly BooleanLiteral = ASTGrammar.create("BooleanLiteral");
    public static readonly NullLiteral = ASTGrammar.create("NullLiteral");
    public static readonly UndefinedLiteral = ASTGrammar.create("UndefinedLiteral");
    public static readonly Identifier = ASTGrammar.create("Identifier");
    public static readonly ThisExpr = ASTGrammar.create("ThisExpression");
    public static readonly ArrayLiteral = ASTGrammar.create("ArrayLiteral");
    public static readonly ObjectLiteral = ASTGrammar.create("ObjectLiteral");
    public static readonly TemplateLiteral = ASTGrammar.create("TemplateLiteral");
    public static readonly RegexLiteral = ASTGrammar.create("RegexLiteral");

    public static readonly PrefixOperator = ASTGrammar.create("PrefixOp");
    public static readonly PostfixOperator = ASTGrammar.create("PostfixOp");
    public static readonly BinaryExpr = ASTGrammar.create("BinaryOp");
    public static readonly TernaryExpr = ASTGrammar.create("TernaryOp");
    public static readonly AssignmentExpr = ASTGrammar.create("AssignmentOp");

    public static readonly MemberAccessExpr = ASTGrammar.create("MemberAccessExpr");
    public static readonly ArrayAccessExpr = ASTGrammar.create("ArrayAccessExpr");
    public static readonly CallExpr = ASTGrammar.create("CallExpr");
    public static readonly NewExpr = ASTGrammar.create("NewExpr");
    public static readonly SpreadExpr = ASTGrammar.create("SpreadExpr");
    public static readonly GroupExpr = ASTGrammar.create("GroupExpr");

    public static readonly CommaExpr = ASTGrammar.create("CommaExpr");
    public static readonly EmptyCommaExpr = ASTGrammar.create("EmptyCommaExpr");

    public static readonly DestructuringListPattern = ASTGrammar.create("DestructuringListPattern");
    public static readonly DestructuringObjectPattern = ASTGrammar.create("DestructuringObjectPattern");
    public static readonly ObjectPropertyKey = ASTGrammar.create("ObjectPropertyKey");
    public static readonly ObjectPropertyValue = ASTGrammar.create("ObjectPropertyValue");
}