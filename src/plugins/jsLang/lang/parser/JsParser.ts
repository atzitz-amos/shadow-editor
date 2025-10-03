import {ASTBuilder} from "../../../../editor/lang/ast/builder/ASTBuilder";
import {IParser} from "../../../../editor/lang/ast/IParser";
import {JsGrammar} from "./JsGrammar";
import {JsLexicalGrammar} from "../lexer/JsLexicalGrammar";
import {Marker} from "../../../../editor/lang/ast/builder/Marker";
import {JsExprParser} from "./JsExprParser";


export class JsParser implements IParser {
    public myIsInAsync = false;
    public myIsInGenerator = false;
    public myIsInFunction = false;
    public myIsSpreadAllowed = false;

    private myExprParser: JsExprParser;

    constructor(private builder: ASTBuilder) {
        this.myExprParser = new JsExprParser(this, builder);
    }

    getExprParser(): JsExprParser {
        return this.myExprParser;
    }

    setInAsync(isInAsync: boolean): void {
        this.myIsInAsync = isInAsync;
    }

    setInGenerator(isInGenerator: boolean): void {
        this.myIsInGenerator = isInGenerator;
    }

    setInFunction(isInFunction: boolean): void {
        this.myIsInFunction = isInFunction;
    }

    setIsSpreadAllowed(isSpreadAllowed: boolean): void {
        this.myIsSpreadAllowed = isSpreadAllowed;
    }

    isAsyncAllowed(): boolean {
        return this.myIsInAsync;
    }

    isInGenerator(): boolean {
        return this.myIsInGenerator;
    }

    isInFunction(): boolean {
        return this.myIsInFunction;
    }

    isSpreadAllowed(): boolean {
        return this.myIsSpreadAllowed;
    }

    parse(): void {
        this.parseBlock(false);
    }

    parseBlockStatement(): void {

    }

    parseBlock(expectBrace = true): void {
        if (expectBrace) {
            this.builder.expect(JsLexicalGrammar.LBRACE).orError("Expected '{'");
        }
        const marker = this.builder.mark();
        while (!this.builder.done() && !this.builder.isNext(JsLexicalGrammar.RBRACE)) {
            this.parseStatementOrExpr();
        }
        if (expectBrace || this.builder.isNext(JsLexicalGrammar.RBRACE)) {
            this.builder.expect(JsLexicalGrammar.RBRACE).orError("Expected '}'");
        }
        marker.done(JsGrammar.CodeBlock);
    }

    parseStatementOrExpr(): void {
        if (this.builder.isNext(JsLexicalGrammar.KEYWORD)) {
            this.parseStatement();
        } else
            this.parseExpression();
    }

    parseStatement() {
        const next = this.builder.seek()!.getValue();
        switch (next) {
            case "if":
                this.parseIfStatement();
                break;
            case "for":
                this.parseForStatement();
                break;
            case "while":
                this.parseWhileStatement();
                break;
            case "do":
                this.parseDoWhileStatement();
                break;
            case "switch":
                this.parseSwitchStatement();
                break;
            case "try":
                this.parseTryCatchStatement();
                break;
            case "function":
                this.parseFunctionDeclaration();
                break;
            default:
                this.builder.error("Unexpected statement");
                this.builder.advance(false);
        }
    }

    parseIfStatement(): void {
        const startMarker = this.builder.mark();
        this.parseIfClause(startMarker);
        while (this.builder.isNext(JsLexicalGrammar.KEYWORD, "else")) {
            this.parseElseIfClause();
        }
    }

    parseIfClause(startMarker: Marker): void {
        this.builder.advance(); // consume 'if'

        this.builder.expect(JsLexicalGrammar.LPAREN).orError("Expected '('");
        this.parseExpression();
        this.builder.expect(JsLexicalGrammar.RPAREN).orError("Expected ')'");
        this.parseBlockStatement();

        startMarker.done(JsGrammar.IfClause);
    }

    parseElseIfClause(): void {
        const marker = this.builder.mark();

        this.builder.advance(); // consume 'else'
        if (this.builder.isNext(JsLexicalGrammar.KEYWORD, "if")) {
            this.parseIfClause(marker);
        } else {
            this.parseBlockStatement();
            marker.done(JsGrammar.ElseClause);
        }
    }

    parseForStatement() {
        // TODO
    }

    parseWhileStatement() {
        const marker = this.builder.mark();

        this.builder.advance(); // consume 'while'
        this.builder.expect(JsLexicalGrammar.LPAREN).orError("Expected '('");
        this.parseExpression();
        this.builder.expect(JsLexicalGrammar.RPAREN).orError("Expected ')'");
        this.parseBlockStatement();

        marker.done(JsGrammar.WhileStatement);
    }

    parseDoWhileStatement() {
        const marker = this.builder.mark();

        this.builder.advance(); // consume 'do'
        this.parseBlockStatement();

        const valid = this.builder.expect(JsLexicalGrammar.KEYWORD, "while").failWith("Expected 'while'")
            .then(JsLexicalGrammar.LPAREN).failWith("Expected '('")
            .isValid();

        if (valid) {
            this.parseExpression();
            this.builder.expect(JsLexicalGrammar.RPAREN).orError("Expected ')'");
        }

        marker.done(JsGrammar.DoWhileStatement);
    }

    parseSwitchStatement() {
        const marker = this.builder.mark();

        this.builder.advance(); // consume 'switch'
        this.builder.expect(JsLexicalGrammar.LPAREN).orError("Expected '('");
        this.parseExpression();
        this.builder.expect(JsLexicalGrammar.RPAREN).failWith("Expected ')'")
            .then(JsLexicalGrammar.LBRACE).orError("Expected '{'");

        while (!this.builder.done() && !this.builder.isNext(JsLexicalGrammar.RBRACE)) {
            if (this.builder.isNext(JsLexicalGrammar.KEYWORD, "case")) {
                this.parseSwitchCaseClause();
            } else if (this.builder.isNext(JsLexicalGrammar.KEYWORD, "default")) {
                this.parseSwitchDefaultClause();
            } else {
                this.parseStatement();
            }
        }

        this.builder.expect(JsLexicalGrammar.RBRACE).orError("Expected '}'");

        marker.done(JsGrammar.SwitchStatement);
    }

    parseSwitchCaseClause() {
        const marker = this.builder.mark();

        this.builder.advance(); // consume 'case'
        this.parseExpression();
        this.builder.expect(JsLexicalGrammar.COLON).orError("Expected ':'");

        marker.done(JsGrammar.SwitchCaseClause);
    }

    parseSwitchDefaultClause() {
        const marker = this.builder.mark();

        this.builder.advance(); // consume 'default'
        this.builder.expect(JsLexicalGrammar.COLON).orError("Expected ':'");

        marker.done(JsGrammar.SwitchDefaultClause);
    }

    parseExpression(): void {
        this.myExprParser.parseExpression();
    }

    parseTryCatchStatement() {
        const marker = this.builder.mark();

        this.builder.advance(); // consume 'try'
        this.parseBlock();

        let parsedClause = false;
        while (this.builder.isNext(JsLexicalGrammar.KEYWORD, "catch")) {
            this.parseCatchClause();
            parsedClause = true;
        }
        if (this.builder.isNext(JsLexicalGrammar.KEYWORD, "finally")) {
            this.parseFinallyClause();
            parsedClause = true;
        }
        if (!parsedClause) {
            this.builder.error("Expected 'catch' or 'finally' after 'try' block");
        }
    }

    parseCatchClause() {
        const marker = this.builder.mark();

        this.builder.advance(); // consume 'catch'
        if (this.builder.isNext(JsLexicalGrammar.LPAREN)) {
            this.builder.advance(); // consume '('
            this.builder.expect(JsLexicalGrammar.IDENTIFIER).orError("Expected identifier");
            this.builder.expect(JsLexicalGrammar.RPAREN).orError("Expected ')'");
        }
        this.parseBlock();

        marker.done(JsGrammar.CatchClause);
    }

    parseFinallyClause() {
        const marker = this.builder.mark();

        this.builder.advance(); // consume 'finally'
        this.parseBlock();

        marker.done(JsGrammar.FinallyClause);
    }

    parseFunctionDeclaration() {
        const marker = this.builder.mark();

        this.builder.advance(); // consume 'function'
        this.builder.expect(JsLexicalGrammar.IDENTIFIER).orError("Expected function name");
        this.builder.expect(JsLexicalGrammar.LPAREN).orError("Expected '('");
        this.parseFunctionArguments();
        this.builder.expect(JsLexicalGrammar.RPAREN).orError("Expected ')'");
        this.parseBlockStatement();

        marker.done(JsGrammar.FunctionDeclaration);
    }

    parseFunctionArguments() {
        const marker = this.builder.mark();

        let isError = false;

        while (!this.builder.done() && !this.builder.isNext(JsLexicalGrammar.RPAREN)) {
            const argumentMarker = this.builder.mark();
            this.myExprParser.parseParameterDeclaration();
            argumentMarker.done(JsGrammar.FunctionArgument);
            if (!this.builder.consumeIf(JsLexicalGrammar.COMMA)) {
                break;
            }
        }
        this.builder.expect(JsLexicalGrammar.RPAREN);

        marker.done(JsGrammar.FunctionArguments);
    }
}