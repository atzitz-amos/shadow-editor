import {ErrorToken, Token, TokenStream} from "../../core/lang/lexer/TokenStream";
import {IParser} from "../../core/lang/parser/IParser";
import {JS} from "./jsLexer";
import {ScopeManager} from "../../core/lang/Scoping";
import {
    JSArgs,
    JSArrayAccess,
    JSArrayLiteral,
    JSAssignExpr,
    JSBinaryExpr,
    JSBody,
    JSCallExpr,
    JSCodeBlock,
    JSDeclStmt,
    JSExpr,
    JSExprCommaExpr,
    JsExprGroup,
    JSFuncDecl,
    JSIdentifier,
    JSLambda,
    JSMemberAccess,
    JSNewExpr,
    JSNodeType,
    JSNumberLiteral,
    JSObjectLiteral,
    JSObjectProperty,
    JSObjectPropertyFunction,
    JSParam,
    JSParameters,
    JSReturnStmt,
    JSSpecialIdentifier,
    JSSrNode,
    JSStringLiteral,
    JSTernaryExpr,
    JSUnaryExpr
} from "./jsNodes";
import {HasRange, TextRange} from "../../core/coordinate/TextRange";
import {JsPrecedenceUtils} from "./jsUtils";
import {JSBlockScope, JSFunctionScope, JSScope, JSScopeManager} from "./jsScope";

/**
 * Implements the Javascript Parser <br>
 * This class does NOT support concurrent usage, so be sure to always use `JSParser.parse` and never call directly this implementation */
class JsParserImpl {
    input: TokenStream<JS>;
    scope: JSScope;

    beginOffsets: number[] = [];

    constructor(scope: JSScope, input: TokenStream<JS>) {
        this.scope = scope;
        this.input = input;
    }

    get offset(): number {
        return this.input.seek()!.range.begin;
    }

    /**
     * Main parser code. Responsible for parsing any group of statements. */
    parseBlock(): JSCodeBlock {
        let result: JSSrNode[] = [];

        this.scope = this.scope.newBlockScope();

        while (!this.input.isEmpty()) {
            const token = this.input.seek()!;
            if (token.type === JS.EOF || token.type === JS.RBrace) {
                break; // End of block, stop parsing
            }
            result.push(this.parseStmt());
            if (this.input.seek()?.type === JS.Punctuation && this.input.seek()?.value === ";") {
                this.input.consume(); // Consume the semicolon
            }
        }

        let codeblock = new JSCodeBlock(result);

        this.scope.range = TextRange.of(codeblock);
        (this.scope as JSBlockScope).block = codeblock;
        this.scope = this.scope.pop();

        return codeblock;
    }

    // +-------------------------+
    // |         Parsing         |
    // +-------------------------+

    private eat(type: JS): Token<JS> | null {
        let token = this.input.seek();
        if (token && token.type === type) {
            this.input.consume();
            return token;
        }
        return null;
    }

    private reportErrorAfter(token: Token<JS>, type: JS, msg: string): Token<any> {
        return new ErrorToken(
            type,
            " ",
            msg,
            TextRange.around(token.range.end)
        );
    }

    private reportErrorAt(token: Token<JS>, type: JS, msg: string) {
        return new ErrorToken(
            type,
            token.value,
            msg,
            token.range
        );
    }

    private reportErrorAtRange(range: HasRange, type: JS, msg: string) {
        return new ErrorToken(
            type,
            "",
            msg,
            range.range.clone()
        );
    }

    private closeScope<T extends JSFuncDecl | JSLambda>(func: T): T {
        if (!func.body) {
            this.scope = this.scope.pop();
            return func;
        }
        this.scope.range = TextRange.of(func.body);
        (this.scope as JSFunctionScope).func = func;
        this.scope = this.scope.pop();
        return func;
    }

    private closeScopeAndDeclare(funcDecl: JSFuncDecl) {
        let func = this.closeScope(funcDecl);
        if (funcDecl.isWellFormed() && funcDecl.name)
            this.scope.declare(funcDecl.name.value, funcDecl);
        return func;
    }

    private parseBody(): JSBody {
        this.scope = this.scope.newFuncScope();
        if (this.input.seek()?.type !== JS.LBRACE) {
            let body = [new JSReturnStmt(null, this.parseExpr())];
            return new JSBody(
                null,
                new JSCodeBlock(body),
                null
            );
        }
        let openBrace = this.eat(JS.LBRACE);
        let stmts: JSCodeBlock = this.parseBlock();
        let closeBrace = this.eat(JS.RBrace);
        if (!closeBrace) {
            return new JSBody(
                openBrace,
                stmts,
                this.reportErrorAt(this.input.seekPrevious()!, JS.SyntaxError, "'}' expected")
            );
        }
        return new JSBody(
            openBrace,
            stmts,
            closeBrace
        );
    }

    private parseStmt(): JSSrNode {
        let token = this.input.seek()!;
        if (token.type == JS.Keyword) {
            if (token.value === "let" || token.value === "const" || token.value === "var") {
                return this.parseDeclStmt();
            } else if (token.value === "function") {
                return this.parseFuncDecl();
            } else if (token.value === "return") {
                return this.parseReturnStmt();
            }
        }
        return this.parseExpr();
    }

    private parseReturnStmt(): JSReturnStmt {
        let keyword = this.eat(JS.Keyword);
        if (this.input.seek()?.type === JS.Punctuation && this.input.seek()?.value === ";"
            || this.input.seek()?.type === JS.EOF
            || this.input.seek()?.type === JS.RBrace
            || this.input.seekIncludeSpecial()?.type === JS.EOL) {
            return new JSReturnStmt(keyword, null);
        }
        return new JSReturnStmt(keyword, this.parseExpr());
    }

    private parseDeclStmt(): JSSrNode {
        let kind = this.eat(JS.Keyword)!;

        let nameToken = this.eat(JS.Identifier);
        if (!nameToken) {
            return new JSDeclStmt(
                kind,
                this.reportErrorAfter(kind, JS.SyntaxError, "Expected identifier"),
            );
        }
        let decl;
        if (this.input.seek()?.type === JS.Equals) {
            let equalsToken = this.eat(JS.Equals)!;
            decl = new JSDeclStmt(
                kind,
                nameToken,
                equalsToken,
                this.parseExpr_L0()
            )
        } else {
            decl = new JSDeclStmt(
                kind,
                nameToken
            );
        }

        this.scope.declare(nameToken.value, decl)
        return decl;
    }

    private parseFuncDecl(allowAnonymous: boolean = false): JSFuncDecl {
        let keyword = this.eat(JS.Keyword)!;

        let identifier = this.eat(JS.Identifier);
        if (!identifier && !allowAnonymous) {
            return new JSFuncDecl(
                keyword,
                this.reportErrorAfter(keyword, JS.SyntaxError, "Function name expected"),
                null,
                null,
                null,
                null
            );
        }

        let openParen = this.eat(JS.LPAREN);
        if (!openParen) {
            return new JSFuncDecl(
                keyword,
                identifier,
                this.reportErrorAfter(identifier || keyword, JS.SyntaxError, "'(' expected"),
                null,
                null,
                null
            );
        }
        let params: JSParameters = this.parseParams();
        let closeParen = this.eat(JS.RPAREN);
        if (!closeParen) {
            return new JSFuncDecl(
                keyword,
                identifier,
                openParen,
                params,
                this.reportErrorAfter(this.input.seekPrevious()!, JS.SyntaxError, "')' expected"),
                null
            );
        }

        let body = this.parseBody();
        return this.closeScopeAndDeclare(new JSFuncDecl(
            keyword,
            identifier,
            openParen,
            params,
            closeParen,
            body
        ));
    }

    private parseParams(): JSParameters {
        let result: JSParam[] = [];
        let commas: Token<JS>[] = [];

        while (!this.input.isEmpty() && this.input.seek()!.type != JS.RPAREN && this.input.seek()!.type != JS.EOF) {
            result.push(this.parseParam());
            if (this.input.seek()?.type === JS.Punctuation && this.input.seek()?.value === ",") {
                commas.push(this.eat(JS.Punctuation)!);
            } else if (this.input.seek()?.type !== JS.RPAREN) {
                commas.push(this.reportErrorAfter(this.input.seekPrevious()!, JS.SyntaxError, "Expected ',' or ')'"));
            } else break;
        }
        return new JSParameters(result, commas);
    }

    private parseParam(): JSParam {
        let restToken: Token<JS> | null = null;
        if (this.input.seek()?.type === JS.Punctuation && this.input.seek()?.value === "...") {
            restToken = this.eat(JS.Punctuation);
        }

        let nameToken = this.eat(JS.Identifier);
        if (!nameToken) {
            return new JSParam(
                this.reportErrorAfter(this.input.seekPrevious()!, JS.SyntaxError, "Parameter name expected"),
                restToken
            )
        } else if (this.input.seek()?.type === JS.Equals) {
            if (restToken)
                return new JSParam(
                    nameToken,
                    restToken,
                    this.reportErrorAt(this.input.consume()!, JS.SyntaxError, "Default value cannot be used with rest parameters"),
                );
            let equalsToken = this.eat(JS.Equals)!;
            let defaultValue = this.parseExpr_L0();
            return new JSParam(nameToken, null, equalsToken, defaultValue);
        } else {
            return new JSParam(nameToken, restToken);
        }
    }

    private parseExpr(): JSExpr {
        // Comma Expressions
        let result = [this.parseExpr_L0()];
        let commas: Token<JS>[] = [];
        while (this.input.seek()?.type === JS.Punctuation && this.input.seek()?.value === ",") {
            commas.push(this.eat(JS.Punctuation)!);
            result.push(this.parseExpr_L0());
        }
        return result.length === 1 ? result[0] : new JSExprCommaExpr(result, commas);
    }

    private parseExpr_L0(): JSExpr {
        // Assignment and Miscellaneous
        let token = this.input.seek();
        if (!token) {
            return new JSExpr(this.reportErrorAfter(
                this.input.seekPrevious()!,
                JS.SyntaxError,
                "Expression expected"
            ));
        }
        if (token.type === JS.Punctuation && token.value === "..."
            || (token.type === JS.Keyword && token.value === "yield")) {
            let token = this.input.consume()!;
            let expr = this.parseExpr_L1();
            return new JSUnaryExpr(
                token,
                expr
            );
        }
        // x => y
        if (this.input.seek()?.type === JS.Identifier && this.input.seekN(1)?.type === JS.Arrow) {
            let identifier = this.eat(JS.Identifier)!;
            let arrowToken = this.eat(JS.Arrow)!;
            let body = this.parseBody();
            return this.closeScope(new JSLambda(new JSParameters([new JSParam(identifier, null)]), arrowToken, body));
        } else if (this.input.seek()?.type === JS.LPAREN && this.input.seekN(1)?.type === JS.RPAREN && this.input.seekN(2)?.type === JS.Arrow) {
            // This is an arrow function with no parameters
            let openParen = this.eat(JS.LPAREN)!;
            let closeParen = this.eat(JS.RPAREN)!;
            let arrowToken = this.eat(JS.Arrow)!;
            let body = this.parseBody();
            return this.closeScope(new JSLambda(new JSParameters([], []), arrowToken, body));
        }
        // Because it is impossible to tell the difference between a grouping and an arrow expression, we start parsing
        // as a regular expression and then check if it is an arrow expression.
        let expr = this.parseExpr_L1();
        if (expr.nodeType === JSNodeType.ExprGroup && this.input.seek()?.type === JS.Arrow) {
            let values, commas;
            if (((expr as JsExprGroup).expr).nodeType === JSNodeType.ExprCommaExpr) {
                let commaExpr = ((expr as JsExprGroup).expr) as JSExprCommaExpr;
                values = commaExpr.values;
                commas = commaExpr.commas;
            } else {
                values = [(expr as JsExprGroup).expr];
                commas = [];
            }

            let arrowToken = this.eat(JS.Arrow)!;
            let body = this.parseBody();
            // We now have to transform the expression into a JSParam list
            let params: JSParam[] = [];
            for (let i = 0; i < values.length; i++) {
                let node = values[i];
                if (node.nodeType === JSNodeType.UnaryExpr && (node as JSUnaryExpr).operator.value === "...") {
                    // This is a rest parameter
                    let rest = (node as JSUnaryExpr).operator;
                    let name = (node as JSUnaryExpr).operand;
                    if (name.nodeType !== JSNodeType.Identifier) {
                        params.push(new JSParam(
                            this.reportErrorAfter(rest, JS.SyntaxError, "Expected identifier"),
                            rest
                        ));
                    } else {
                        params.push(new JSParam(
                            (name as JSIdentifier).token,
                            rest
                        ));
                    }
                } else {
                    if (node.nodeType === JSNodeType.AssignExpr) {
                        params.push(new JSParam(
                            ((node as JSAssignExpr).left as JSIdentifier).token,
                            null,
                            (node as JSAssignExpr).operator,
                            (node as JSAssignExpr).right!
                        ));
                    } else if (node.nodeType !== JSNodeType.Identifier) {
                        params.push(new JSParam(
                            this.reportErrorAfter(commas[i], JS.SyntaxError, "Expected identifier"),
                            null
                        ));
                    } else {
                        params.push(new JSParam((node as JSIdentifier).token, null))
                    }
                }
            }
            return this.closeScope(new JSLambda(new JSParameters(params, commas), arrowToken, body));
        }
        if (this.input.seek()?.type === JS.Punctuation && this.input.seek()?.value === "?") {
            // Ternary operator
            let questionMark = this.eat(JS.Punctuation)!;
            let trueExpr = this.parseExpr_L0();
            if (this.input.seek()?.type !== JS.Punctuation || this.input.seek()?.value !== ":") {
                return new JSTernaryExpr(
                    expr,
                    questionMark,
                    trueExpr,
                    this.reportErrorAfter(this.input.seekPrevious()!, JS.SyntaxError, "Expected ':' for ternary operator"),
                    null);
            }
            let colon = this.eat(JS.Punctuation)!;
            let falseExpr = this.parseExpr_L0();
            return new JSTernaryExpr(
                expr,
                questionMark,
                trueExpr,
                colon,
                falseExpr
            );
        }
        if (this.input.seek()?.type === JS.EqualOp || this.input.seek()?.type === JS.Equals) {
            let token = this.input.consume();
            return new JSAssignExpr(expr, token!, this.parseExpr());
        }
        return expr;
    }

    private parseExpr_L1(): JSExpr {
        // Logical and bitwise logical
        let result = this.parseExpr_L2();
        let token = this.input.seek();

        if (token?.type !== JS.Operator) return result;

        if (token?.value === "??" || token?.value === "||") {
            let operator = this.eat(JS.Operator)!;
            let right = this.parseExpr_L2();
            return new JSBinaryExpr(result, operator, right);
        } else if (token?.value === "&&") {
            let operator = this.eat(JS.Operator)!;
            let right = this.parseExpr_L2();
            return new JSBinaryExpr(result, operator, right);
        } else if (token?.value === "|") {
            let operator = this.eat(JS.Operator)!;
            let right = this.parseExpr_L2();
            return new JSBinaryExpr(result, operator, right);
        } else if (token?.value === "^") {
            let operator = this.eat(JS.Operator)!;
            let right = this.parseExpr_L2();
            return new JSBinaryExpr(result, operator, right);
        } else if (token?.value === "&") {
            let operator = this.eat(JS.Operator)!;
            let right = this.parseExpr_L2();
            return new JSBinaryExpr(result, operator, right);
        } else {
            return result;
        }
    }

    private parseExpr_L2(): JSExpr {
        // Equality and Comparison
        let result = this.parseExpr_L3();
        let token = this.input.seek();

        while (token?.type === JS.CompareOp || token?.type === JS.Keyword) {
            if (token.type === JS.Keyword && token.value !== "in" && token.value !== "instanceof") {
                return result; // We let someone else handle the error
            }
            result = new JSBinaryExpr(result, this.input.consume()!, this.parseExpr_L3());
            token = this.input.seek();
        }
        return result;
    }

    private parseExpr_L3(minPrecedence = 0): JSExpr {
        // Bitwise shift, Addition and Subtraction, Multiplication, Division, Modulus, Exponentiation
        // Uses a Pratt Parser to try and limit the depth of the calling chain
        let result = this.parseExpr_L4();

        while (this.input.seek()?.type === JS.Operator) {
            let operator = this.input.consume()!;
            if (JsPrecedenceUtils.getPrecedence(operator.value) < minPrecedence) {
                break;
            }
            let right = this.parseExpr_L3(JsPrecedenceUtils.isRightAssociative(operator.value) ? minPrecedence : minPrecedence + 1);
            result = new JSBinaryExpr(result, operator, right);
        }
        return result;
    }

    private parseExpr_L4(): JSExpr {
        // Unary operators, array access and call expressions
        let token = this.input.seek();
        if (token?.type === JS.Keyword && token.value === "new") {
            this.eat(JS.Keyword);
            let newExpr = this.parseExpr_L5();
            if (this.input.seek()?.type === JS.LPAREN) {
                let openParen = this.eat(JS.LPAREN)!;
                let args: JSArgs = this.parseArgs();
                let closeParen = this.eat(JS.RPAREN);
                if (!closeParen) {
                    return new JSNewExpr(
                        token,
                        newExpr,
                        openParen,
                        args,
                        this.reportErrorAfter(this.input.seekPrevious()!, JS.SyntaxError, "')' expected")
                    );
                }
                return new JSNewExpr(token, newExpr, openParen, args, closeParen);
            }
            return new JSNewExpr(token, newExpr, null, null, null);
        } else if (token?.type === JS.UnOperator
            || token?.type === JS.Keyword && ["typeof", "void", "delete", "await"].includes(token.value)
            || token?.type === JS.Operator && (token.value === "+" || token.value === "-")) {
            let operator = this.input.consume()!;
            let operand = this.parseExpr_L4();
            return new JSUnaryExpr(operator, operand);
        } else if (token?.type === JS.IncrDecrOp) {
            let operator = this.input.consume()!;
            let operand = this.parseExpr_L5();
            return new JSUnaryExpr(operator, operand);
        }
        // Call expressions, array access
        let result = this.parseExpr_L5();
        while (true) {
            if (this.input.seek()?.type === JS.LPAREN) {
                let openParen = this.eat(JS.LPAREN)!;
                let args: JSArgs = this.parseArgs();
                let closeParen = this.eat(JS.RPAREN);
                if (!closeParen) {
                    return new JSCallExpr(
                        result,
                        openParen,
                        args,
                        this.reportErrorAfter(this.input.seekPrevious()!, JS.SyntaxError, "')' expected")
                    )
                }
                result = this.parseExpr_L5(new JSCallExpr(
                    result,
                    openParen,
                    args,
                    closeParen
                ));
            } else if (this.input.seek()?.type === JS.LBRACKET) {
                let openBracket = this.eat(JS.LBRACKET)!;
                let index = this.parseExpr();
                let closeBracket = this.eat(JS.RBRACKET);
                if (!closeBracket) {
                    return new JSArrayAccess(
                        result,
                        openBracket,
                        index,
                        this.reportErrorAt(this.input.seekPrevious()!, JS.SyntaxError, "']' expected")
                    );
                }
                result = this.parseExpr_L5(new JSArrayAccess(
                    result,
                    openBracket,
                    index,
                    closeBracket
                ));
            } else {
                return result;
            }
        }
    }

    private parseExpr_L5(nd?: JSExpr): JSExpr {
        // Member access
        nd = nd || this.parseExpr_L6();
        while (this.input.seek()?.type === JS.Punctuation && this.input.seek()?.value === ".") {
            let dot = this.eat(JS.Punctuation)!;
            nd = new JSMemberAccess(nd, dot, this.parseExpr_L6());
        }
        return nd;
    }

    private parseExpr_L6(): JSExpr {
        // Primary expressions
        let token = this.input.seek();
        if (token?.type === JS.Keyword) {
            if (token.value !== "this" && token.value !== "super" && token.value !== "null" && token.value !== "true" && token.value !== "false") {
                return new JSExpr(this.reportErrorAt(this.input.consume()!, JS.SyntaxError, "Unexpected keyword"));
            }
            return new JSSpecialIdentifier(this.input.consume()!);
        } else if (token?.type === JS.LPAREN) {
            let openParen = this.eat(JS.LPAREN)!;
            let expr = this.parseExpr();
            let closeParen = this.eat(JS.RPAREN);
            if (!closeParen) {
                return new JsExprGroup(
                    openParen,
                    expr,
                    this.reportErrorAt(this.input.seekPrevious()!, JS.SyntaxError, "')' expected")
                );
            }
            return new JsExprGroup(openParen, expr, closeParen);
        } else if (token?.type === JS.Identifier) {
            return new JSIdentifier(this.input.consume()!);
        } else if (token?.type === JS.Number) {
            return new JSNumberLiteral(this.input.consume()!);
        } else if (token?.type === JS.String) {
            return new JSStringLiteral(this.input.consume()!);
        } else if (token?.type === JS.LBRACKET) {
            let openBracket = this.eat(JS.LBRACKET)!;
            let elements: JSExpr[] = [];
            let commas: Token<JS>[] = [];
            while (!this.input.isEmpty() && this.input.seek()?.type !== JS.RBRACKET) {
                elements.push(this.parseExpr_L0());
                if (this.input.seek()?.type === JS.Punctuation && this.input.seek()?.value === ",") {
                    commas.push(this.eat(JS.Punctuation)!);
                } else break;
            }
            let closeBracket = this.eat(JS.RBRACKET);
            if (!closeBracket) {
                return new JSArrayLiteral(
                    openBracket,
                    elements,
                    this.reportErrorAt(this.input.seekPrevious()!, JS.SyntaxError, "']' expected"),
                    commas
                )
            }
            return new JSArrayLiteral(openBracket, elements, closeBracket, commas);
        } else if (token?.type === JS.LBRACE) {
            return this.parseObjectLiteral();
        } else if (!token) {
            return new JSExpr(this.reportErrorAfter(this.input.seekPrevious()!, JS.SyntaxError, "Unexpected EOF"));
        }
        return new JSExpr(this.reportErrorAt(this.input.consume()!, JS.SyntaxError, "Unexpected token"));
    }

    private parseArgs(): JSArgs {
        let result: JSExpr[] = [];
        let commas: Token<JS>[] = [];
        while (!this.input.isEmpty() && this.input.seek()?.type !== JS.RPAREN) {
            result.push(this.parseExpr_L0());
            if (this.input.seek()?.type === JS.Punctuation && this.input.seek()?.value === ",") {
                commas.push(this.eat(JS.Punctuation)!);
            } else break;
        }
        return new JSArgs(result, commas)
    }

    private parseObjectLiteral(): JSObjectLiteral {
        let openBrace = this.eat(JS.LBRACE)!;

        let properties: JSObjectProperty[] = [];
        let commas: Token<JS>[] = [];

        while (!this.input.isEmpty() && this.input.seek()?.type !== JS.RBrace) {
            let key = this.input.seek()!;
            if (key.type !== JS.Identifier && key.type !== JS.String) {
                properties.push(new JSObjectProperty(this.reportErrorAt(this.input.consume()!, JS.SyntaxError, "Expected identifier or string as key"), null, null));
            } else if (key.type === JS.Identifier && (key.value === "get" || key.value === "set") && this.input.seekN(1)?.type === JS.Identifier) {
                let keyword = this.input.consume()!;

                // The `eat(JS.Keyword)` of `parseFuncDecl` will fail silently, but we can still parse the function declaration
                let funcDecl = this.parseFuncDecl();
                funcDecl.keyword = keyword;
                properties.push(new JSObjectPropertyFunction(funcDecl));
            } else if (key.type === JS.Identifier || key.type === JS.String) {
                let identifier = this.input.consume()!;
                let colon = this.input.seek();
                if (colon?.type !== JS.Punctuation || colon.value !== ":") {
                    if (identifier.type === JS.String) {    // Not fine
                        properties.push(new JSObjectProperty(
                            key,
                            this.reportErrorAfter(key, JS.SyntaxError, "':' expected"),
                            null
                        ));
                    } else {  // Fine as the value is just the key itself
                        properties.push(new JSObjectProperty(
                            identifier,
                            null,
                            new JSIdentifier(identifier)
                        ));
                    }
                } else {
                    this.eat(JS.Punctuation);
                    let value = this.parseExpr_L0();
                    properties.push(new JSObjectProperty(identifier, colon, value));
                }
            }
            if (this.input.seek()?.type !== JS.Punctuation || this.input.seek()?.value !== ",") {
                break; // No more properties
            }
            commas.push(this.eat(JS.Punctuation)!);
        }
        let closeBrace = this.eat(JS.RBrace);
        if (!closeBrace) {
            return new JSObjectLiteral(
                openBrace,
                properties,
                this.reportErrorAfter(this.input.seekPrevious()!, JS.SyntaxError, "'}' expected"),
                commas
            );
        }
        return new JSObjectLiteral(
            openBrace,
            properties,
            closeBrace,
            commas
        );
    }
}

/**
 * Represent the JSParser. Responsible for managing JSScopes, JSSrNodes, etc... */
export class JSParser implements IParser<JS> {


    createScopeManager(): ScopeManager {
        return new JSScopeManager();
    }

    parse(scope: JSScope, input: TokenStream<JS>): JSCodeBlock {
        return new JsParserImpl(scope, input).parseBlock();
    }
}