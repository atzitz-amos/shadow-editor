import {SpacingRule} from "../../../lang/codeStyle/spacing/SpacingRule";
import {JsLexicalGrammar} from "../lang/lexer/JsLexicalGrammar";
import {JsGrammar} from "../lang/parser/JsGrammar";
import {JsArrowFunctionExpr} from "../lang/syntax/expr/JsArrowFunctionExpr";
import {JsFunction} from "../lang/syntax/api/JsFunction";

/**
 *
 * @author Atzitz Amos
 * @date 8/15/2026
 * @since 1.0.0
 */
export class JsSpacingRules {
    public static readonly SPACE_BEFORE_LINE_COMMENT = new SpacingRule("Space before line comment")
        .before(JsLexicalGrammar.SINGLE_LINE_COMMENT)
        .space();

    public static readonly SPACE_BEFORE_IF_PAREN = new SpacingRule("Space before '(' of if statements")
        .before(JsLexicalGrammar.LPAREN)
        .in(JsGrammar.IfClause)
        .in(JsGrammar.ElseClause)
        .space();

    public static readonly SPACE_BEFORE_FOR_PAREN = new SpacingRule("Space before '(' of for statements")
        .before(JsLexicalGrammar.LPAREN)
        .in(JsGrammar.ForIStatement)
        .in(JsGrammar.ForOfStatement)
        .in(JsGrammar.ForInStatement)
        .space();

    public static readonly SPACE_BEFORE_WHILE_PAREN = new SpacingRule("Space before '(' of while statements")
        .before(JsLexicalGrammar.LPAREN)
        .in(JsGrammar.WhileStatement)
        .space();

    public static readonly SPACE_BEFORE_DO_WHILE_PAREN = new SpacingRule("Space before '(' of do while statements")
        .after(JsLexicalGrammar.LPAREN)
        .in(JsGrammar.DoWhileStatement)
        .space();

    public static readonly SPACE_BEFORE_SWITCH_PAREN = new SpacingRule("Space before '(' of switch statements")
        .before(JsLexicalGrammar.LPAREN)
        .in(JsGrammar.SwitchStatement)
        .space();

    public static readonly SPACE_BEFORE_CATCH_PAREN = new SpacingRule("Space before '(' of catch statements")
        .before(JsLexicalGrammar.LPAREN)
        .in(JsGrammar.CatchClause)
        .space();

    public static readonly SPACE_BEFORE_FUNCTION_DECLARATION_PAREN = new SpacingRule("Space before '(' of function declarations")
        .before(JsLexicalGrammar.LPAREN)
        .in(JsGrammar.FunctionDeclaration)
        .in(JsGrammar.FunctionExpression)
        .if((p, n, node) => (node as unknown as JsFunction).getNameToken() !== null)
        .noSpace();

    public static readonly SPACE_BEFORE_FUNCTION_EXPRESSION_PAREN = new SpacingRule("Space before '(' of function expressions")
        .before(JsLexicalGrammar.LPAREN)
        .in(JsGrammar.FunctionDeclaration)
        .in(JsGrammar.FunctionExpression)
        .if((p, n, node) => (node as unknown as JsFunction).getNameToken() === null)
        .space();

    public static readonly SPACE_BEFORE_ASYNC_ARROW_FUNCTION_PAREN = new SpacingRule("Space before '(' of async arrow functions")
        .before(JsLexicalGrammar.LPAREN)
        .in(JsGrammar.ArrowFunctionExpression)
        .if((p, n, node) => (node as JsArrowFunctionExpr).isAsync())
        .space();

    public static readonly SPACE_BEFORE_FUNCTION_CALL_PAREN = new SpacingRule("Space before '(' of function calls")
        .before(JsLexicalGrammar.LPAREN)
        .in(JsGrammar.CallExpr)
        .noSpace();

    public static readonly SPACE_BEFORE_NEW_CALL_PAREN = new SpacingRule("Space before '(' of new calls")
        .before(JsLexicalGrammar.LPAREN)
        .in(JsGrammar.NewExpr)
        .noSpace();

    public static readonly SPACE_BEFORE_ELSE = new SpacingRule("Space before 'else'")
        .before(JsLexicalGrammar.KEYWORD)
        .in(JsGrammar.ElseClause)
        .space();

    public static readonly SPACE_BEFORE_CATCH = new SpacingRule("Space before 'catch'")
        .before(JsLexicalGrammar.KEYWORD)
        .in(JsGrammar.CatchClause)
        .space();

    public static readonly SPACE_BEFORE_FINALLY = new SpacingRule("Space before 'finally'")
        .before(JsLexicalGrammar.KEYWORD)
        .in(JsGrammar.FinallyClause)
        .space();

    public static readonly SPACE_AFTER_COMMA_IN_FUNCTION_CALL = new SpacingRule("Space after ',' in function calls")
        .after(JsLexicalGrammar.COMMA)
        .in(JsGrammar.CallExpr)
        .space();


    public static readonly SPACE_AFTER_COMMA_IN_FUNCTION_DECLARATION = new SpacingRule("Space after ',' in function declarations")
        .after(JsLexicalGrammar.COMMA)
        .in(JsGrammar.FunctionArguments)
        .space();

    public static readonly SPACE_AFTER_COMMA_IN_ARRAY_LITERAL = new SpacingRule("Space after ',' in array literals")
        .after(JsLexicalGrammar.COMMA)
        .in(JsGrammar.ArrayLiteral)
        .space();

    public static readonly SPACE_AFTER_COMMA_IN_PATTERN_DESTRUCTURING = new SpacingRule("Space after ',' in pattern destructuring")
        .after(JsLexicalGrammar.COMMA)
        .in(JsGrammar.DestructuringListPattern)
        .in(JsGrammar.DestructuringObjectPattern)
        .space();

    public static readonly SPACE_AFTER_COMMA_IN_DECLARATION = new SpacingRule("Space after ',' in variable declarations")
        .after(JsLexicalGrammar.COMMA)
        .in(JsGrammar.VariableDeclaration)
        .space();

    public static readonly SPACE_AFTER_COMMA_IN_OBJECT_LITERAL = new SpacingRule("Space after ',' in object literals")
        .after(JsLexicalGrammar.COMMA)
        .in(JsGrammar.ObjectLiteral)
        .space();

    public static readonly SPACE_AFTER_SEMICOLON_IN_FOR = new SpacingRule("Space after ';' in for statements")
        .after(JsLexicalGrammar.SEMICOLON)
        .in(JsGrammar.ForIStatement)
        .space();

    public static readonly NO_SPACE_BEFORE_SEMICOLON = new SpacingRule("No space before semicolon")
        .before(JsLexicalGrammar.SEMICOLON)
        .noSpace();

    public static readonly NO_SPACE_BEFORE_COMMA = new SpacingRule("No space before comma")
        .before(JsLexicalGrammar.COMMA)
        .noSpace();


    public static readonly SPACE_AROUND_MATH_OPERATOR = new SpacingRule("Space around math operator")
        .around(JsLexicalGrammar.MATHEMATICAL_OPERATOR)
        .space();

    public static readonly SPACE_AROUND_ASSIGNMENT_OPERATOR = new SpacingRule("Space around assignment operator")
        .around(JsLexicalGrammar.ASSIGNMENT_OPERATOR)
        .space();

    public static readonly SPACE_AROUND_COMPARISON_OPERATOR = new SpacingRule("Space around comparison operator")
        .around(JsLexicalGrammar.COMPARISON_OPERATOR)
        .space();

    public static readonly SPACE_AROUND_LOGICAL_OPERATOR = new SpacingRule("Space around logical operator")
        .around(JsLexicalGrammar.LOGICAL_OPERATOR)
        .space();

    public static readonly SPACE_AROUND_BITWISE_OPERATOR = new SpacingRule("Space around bitwise operator")
        .around(JsLexicalGrammar.BITWISE_OPERATOR)
        .space();

    public static readonly SPACE_AFTER_PREFIX_OPERATOR = new SpacingRule("Space after prefix operator")
        .after(JsLexicalGrammar.POSTFIX_OPERATOR)
        .in(JsGrammar.PrefixOperator)
        .noSpace();

    public static readonly SPACE_BEFORE_POSTFIX_OPERATOR = new SpacingRule("Space around postfix operator")
        .before(JsLexicalGrammar.POSTFIX_OPERATOR)
        .in(JsGrammar.PostfixOperator)
        .noSpace();

    public static readonly SPACE_AROUND_LAMBDA_ARROW = new SpacingRule("Space around lambda arrow")
        .around(JsLexicalGrammar.ARROW)
        .space();

    public static readonly NO_SPACE_AROUND_MEMBER_ACCESS = new SpacingRule("No space around member access")
        .around(JsLexicalGrammar.DOT)
        .noSpace();

    public static readonly SPACE_BEFORE_TERNARY_QUESTION_MARK = new SpacingRule("Space before ternary '?'")
        .before(JsLexicalGrammar.QUESTION_MARK)
        .in(JsGrammar.TernaryExpr)
        .space();

    public static readonly SPACE_AFTER_TERNARY_QUESTION_MARK = new SpacingRule("Space after ternary '?'")
        .after(JsLexicalGrammar.QUESTION_MARK)
        .in(JsGrammar.TernaryExpr)
        .space();

    public static readonly SPACE_BEFORE_TERNARY_COLON = new SpacingRule("Space before ternary ':'")
        .before(JsLexicalGrammar.COLON)
        .in(JsGrammar.TernaryExpr)
        .space();

    public static readonly SPACE_AFTER_TERNARY_COLON = new SpacingRule("Space after ternary ':'")
        .after(JsLexicalGrammar.COLON)
        .in(JsGrammar.TernaryExpr)
        .space();

    public static readonly SPACE_AFTER_OBJECT_COLON = new SpacingRule("Space after ':' in object literals")
        .after(JsLexicalGrammar.COLON)
        .in(JsGrammar.ObjectPropertyKey)
        .in(JsGrammar.DestructuringObjectPattern)
        .space();

    public static readonly SPACE_BEFORE_CODEBLOCK = new SpacingRule("Space before code block")
        .before(JsLexicalGrammar.LBRACE)
        .in(JsGrammar.CodeBlock)
        .space();

    public static readonly DEFAULT_RULE_SPACE_AFTER_KEYWORD = new SpacingRule("Space after keyword")
        .after(JsLexicalGrammar.KEYWORD)
        .withPriority(-1)
        .space();

    public static readonly DEFAULT_RULE_NO_SPACE_AROUND_OPEN_PAREN = new SpacingRule("No space around opening parenthesis")
        .around(JsLexicalGrammar.LPAREN)
        .withPriority(-2)
        .noSpace();

    public static readonly DEFAULT_RULE_NO_SPACE_AROUND_CLOSE_PAREN = new SpacingRule("No space around closing parenthesis")
        .around(JsLexicalGrammar.RPAREN)
        .withPriority(-2)
        .noSpace();

    public static readonly DEFAULT_RULE_NO_SPACE_AROUND_OPEN_BRACKET = new SpacingRule("No space after opening bracket")
        .around(JsLexicalGrammar.LBRACKET)
        .withPriority(-1)
        .noSpace();

    public static readonly DEFAULT_RULE_NO_SPACE_AROUND_CLOSE_BRACKET = new SpacingRule("No space before closing bracket")
        .around(JsLexicalGrammar.RBRACKET)
        .withPriority(-1)
        .noSpace();

    public static readonly DEFAULT_RULE_NO_SPACE_BEFORE_COLON = new SpacingRule("No space before colon")
        .before(JsLexicalGrammar.COLON)
        .withPriority(-1)
        .noSpace();

    public static readonly DEFAULT_RULE_SPACE_AFTER_COLON = new SpacingRule("Space after colon")
        .after(JsLexicalGrammar.COLON)
        .withPriority(-1)
        .space();

    public static readonly DEFAULT_RULE_NO_SPACE_BEFORE_BRACE = new SpacingRule("No space before brace")
        .before(JsLexicalGrammar.LBRACE)
        .withPriority(-1)
        .noSpace();
}

