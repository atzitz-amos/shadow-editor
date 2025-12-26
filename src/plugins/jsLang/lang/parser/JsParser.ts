import {JsGrammar} from "./JsGrammar";
import {JsLexicalGrammar} from "../lexer/JsLexicalGrammar";
import {JsExprParser} from "./JsExprParser";
import {ASTBuilder} from "../../../../core/lang/builder/parser/builder/ASTBuilder";
import {IParser} from "../../../../core/lang/builder/parser/IParser";
import {Marker} from "../../../../core/lang/builder/parser/builder/Marker";
import {SynScopeType} from "../../../../core/lang/builder/parser/scopes/SynScopeType";


export class JsParser implements IParser {
    public myIsInAsync = true;
    public myIsInGenerator = false;
    public myIsInFunction = false;
    public myIsSpreadAllowed = false;
    public myIsInLoop = false;

    private readonly myExprParser: JsExprParser;

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

    setInLoop(isInLoop: boolean): void {
        this.myIsInLoop = isInLoop;
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

    isInLoop(): boolean {
        return this.myIsInLoop;
    }

    isSpreadAllowed(): boolean {
        return this.myIsSpreadAllowed;
    }

    insertSemicolonIfNeeded(): boolean {
        if (this.builder.beforeNewLine() || this.builder.done() || this.builder.isNext(JsLexicalGrammar.RBRACE)) {
            return true;
        }
        return !!this.builder.consumeIf(JsLexicalGrammar.SEMICOLON);

    }

    async parse(): Promise<void> {
        this.parseBlock(false, false, false, false, SynScopeType.Global);
    }

    parseBlockStatement(): void {
        if (this.builder.isNext(JsLexicalGrammar.LBRACE)) {
            this.parseBlock(true);
        } else {
            this.parseStatementOrExpr();
        }
    }

    parseBlock(expectBrace = true, isFunction = true, isAsync = false, isGenerator = false, scopeType?: SynScopeType): void {
        const prevIsInAsync = this.myIsInAsync;
        const prevIsInGenerator = this.myIsInGenerator;
        const prevIsInFunction = this.myIsInFunction;
        this.setInFunction(isFunction);
        this.setInAsync(isAsync);
        this.setInGenerator(isGenerator);

        const marker = this.builder.mark(scopeType ?? SynScopeType.Block);
        if (expectBrace) {
            const isValid = this.builder.expect(JsLexicalGrammar.LBRACE).failWith("Expected '{'").isValid();
            if (!isValid) return marker.done(JsGrammar.CodeBlock);
        }
        while (!this.builder.done() && !(expectBrace && this.builder.isNext(JsLexicalGrammar.RBRACE))) {
            this.parseStatementOrExpr();
        }
        if (expectBrace) {
            this.builder.expect(JsLexicalGrammar.RBRACE).orError("Expected '}'");
        }
        marker.done(JsGrammar.CodeBlock);

        this.setInFunction(prevIsInFunction);
        this.setInAsync(prevIsInAsync);
        this.setInGenerator(prevIsInGenerator);
    }

    parseStatementOrExpr(): void {
        if (this.builder.isNext(JsLexicalGrammar.KEYWORD)) {
            this.parseStatement();
        } else if (this.builder.isNext(JsLexicalGrammar.LBRACE)) {
            this.parseBlock();
        } else if (this.builder.isNext(JsLexicalGrammar.SEMICOLON)) {
            const marker = this.builder.mark();
            this.builder.advance(); // consume ';'
            marker.done(JsGrammar.EmptyStatement);
            return;
        } else {
            this.parseExpression();
        }

        if (!this.insertSemicolonIfNeeded()) {
            this.builder.error("Expected semicolon or newline");
        }
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
            case "case":
                this.reportOutOfContextKeyword("case outside of switch statement");
                break;
            case "default":
                this.reportOutOfContextKeyword("default outside of switch statement");
                break;
            case "try":
                this.parseTryCatchStatement();
                break;
            case "catch":
                this.reportOutOfContextKeyword("catch outside of try block");
                break;
            case "finally":
                this.reportOutOfContextKeyword("finally outside of try block");
                break;
            case "static":
            case "async":
            case "function":
                this.parseFunctionDeclaration();
                break;
            case "return":
                this.parseReturnStatement();
                break;
            case "break":
                this.parseBreakStatement();
                break;
            case "continue":
                this.parseContinueStatement();
                break;
            case "throw":
                this.parseThrowStatement();
                break;
            case "debugger":
                this.parseDebuggerStatement();
                break;
            case "var":
            case "let":
            case "const":
                this.parseVariableStatement();
                break;
            case "class":
                this.parseClassDeclaration();
                break;
            case "this":
            case "null":
            case "true":
            case "false":
            case "undefined":
            case "super":
            case "typeof":
            case "void":
            case "delete":
            case "new":
                this.parseExpression(false);
                break;
            case "yield":
                this.parseExpression(false);
                break;
            case "await":
                this.parseExpression(false);
                break;

            default:
                this.builder.advance();
                this.builder.popAndError("Unexpected keyword");
        }
    }

    parseIfStatement(): void {
        const startMarker = this.builder.mark();
        this.parseIfClause(startMarker);
        while (this.builder.isNext(JsLexicalGrammar.KEYWORD, "else")) {
            this.parseElseIfClause();
        }
    }

    parseIfClause(startMarker: Marker): boolean {
        this.builder.advance(); // consume 'if'

        const isValid = this.builder.expect(JsLexicalGrammar.LPAREN).failWith("Expected '('")
            .then(() => this.parseExpression())
            .then(JsLexicalGrammar.RPAREN).failWith("Expected ')'")
            .then(() => this.parseBlockStatement()).isValid();

        startMarker.done(JsGrammar.IfClause);

        return isValid;
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

        this.builder.expect(JsLexicalGrammar.LPAREN).failWith("Expected '('")
            .then(() => this.parseExpression())
            .then(JsLexicalGrammar.RPAREN).failWith("Expected ')'")
            .then(() => this.parseBlockStatement());

        marker.done(JsGrammar.WhileStatement);
    }

    parseDoWhileStatement() {
        const marker = this.builder.mark();

        this.builder.advance(); // consume 'do'
        this.parseBlockStatement();

        this.builder.expect(JsLexicalGrammar.KEYWORD, "while").failWith("Expected 'while'")
            .then(JsLexicalGrammar.LPAREN).failWith("Expected '('")
            .then(() => this.parseExpression())
            .then(JsLexicalGrammar.RPAREN).failWith("Expected ')'")

        marker.done(JsGrammar.DoWhileStatement);
    }

    parseSwitchStatement() {
        const marker = this.builder.mark();

        this.builder.advance(); // consume 'switch'

        let isValid = this.builder.expect(JsLexicalGrammar.LPAREN).failWith("Expected '('")
            .then(() => this.parseExpression())
            .then(JsLexicalGrammar.RPAREN).failWith("Expected ')'")
            .then(JsLexicalGrammar.LBRACE).failWith("Expected '{'").isValid();
        if (!isValid) {
            marker.done(JsGrammar.SwitchStatement);
            return;
        }

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

        this.parseExpression(false);
        this.builder.expect(JsLexicalGrammar.COLON).orError("Expected ':'");

        marker.done(JsGrammar.SwitchCaseClause);
    }

    parseSwitchDefaultClause() {
        const marker = this.builder.mark();

        this.builder.advance(); // consume 'default'
        this.builder.expect(JsLexicalGrammar.COLON).orError("Expected ':'");

        marker.done(JsGrammar.SwitchDefaultClause);
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

        marker.done(JsGrammar.TryCatchStatement);
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

        this.builder.consumeIf(JsLexicalGrammar.KEYWORD, "static");
        let isAsync = !!this.builder.consumeIf(JsLexicalGrammar.KEYWORD, "async");

        let isValid = this.builder.expect(JsLexicalGrammar.KEYWORD, "function").orError("Expected 'function'"); // consume 'function'
        if (!isValid) {
            marker.done(JsGrammar.FunctionDeclaration);
            return;
        }
        let isGenerator = !!this.builder.consumeIf(JsLexicalGrammar.MATHEMATICAL_OPERATOR, "*");

        this.builder.expect(JsLexicalGrammar.IDENTIFIER).failWith("Function statement requires name");

        this.builder.expect(JsLexicalGrammar.LPAREN).failWith("Expected '('")
            .then(() => this.myExprParser.parseFunctionArgumentDeclaration())
            .then(JsLexicalGrammar.RPAREN).failWith("Expected ')'")
            .then(() => {
                this.parseBlock(true, true, isAsync, isGenerator, SynScopeType.Function);
            });

        marker.done(JsGrammar.FunctionDeclaration);
    }

    parseReturnStatement() {
        const marker = this.builder.mark();

        this.builder.advance(); // consume 'return'
        if (!this.insertSemicolonIfNeeded()) {
            this.parseExpression();
        }
        marker.done(JsGrammar.ReturnStatement);
    }

    parseBreakStatement() {
        const marker = this.builder.mark();
        this.builder.advance(); // consume 'break'
        if (!this.insertSemicolonIfNeeded()) {
            this.builder.expect(JsLexicalGrammar.IDENTIFIER).orError("Expected label identifier");
        }
        marker.done(JsGrammar.BreakStatement);
    }

    parseContinueStatement() {
        const marker = this.builder.mark();

        this.builder.advance(); // consume 'continue'
        if (!this.insertSemicolonIfNeeded()) {
            this.builder.expect(JsLexicalGrammar.IDENTIFIER).orError("Expected label identifier");
        }
        marker.done(JsGrammar.ContinueStatement);
    }

    parseThrowStatement() {
        const marker = this.builder.mark();

        this.builder.advance(); // consume 'throw'
        this.parseExpression();
        marker.done(JsGrammar.ThrowStatement);
    }

    parseDebuggerStatement() {
        const marker = this.builder.mark();

        this.builder.advance(); // consume 'debugger'
        marker.done(JsGrammar.DebuggerStatement);
    }

    parseClassDeclaration() {
        const marker = this.builder.mark();

        this.builder.advance();
        this.builder.expect(JsLexicalGrammar.IDENTIFIER).failWith("Class declaration requires name");
        if (this.builder.consumeIf(JsLexicalGrammar.KEYWORD, "extends")) {
            this.parseExpression(false);
        }
        this.builder.expect(JsLexicalGrammar.LBRACE).failWith("Expected '{'")
            .then(() => this.parseClassBody())
            .then(JsLexicalGrammar.RBRACE).failWith("Expected '}'");

        marker.done(JsGrammar.ClassDeclaration);
    }

    parseClassBody() {
        const marker = this.builder.mark();

        while (!this.builder.done() && !this.builder.isNext(JsLexicalGrammar.RBRACE)) {
            this.parseClassElement();
        }

        marker.done(JsGrammar.ClassBody);
    }

    parseClassElement() {
        const start = this.builder.mark();

        const isPrivateField = this.builder.consumeIf(JsLexicalGrammar.HASHTAG); // If it's a private field or method
        const isStatic = !!this.builder.consumeIf(JsLexicalGrammar.KEYWORD, "static");
        const isAsync = !!this.builder.consumeIf(JsLexicalGrammar.KEYWORD, "async");

        const next = this.builder.seek()!;
        if (next.isType(JsLexicalGrammar.IDENTIFIER)) {
            if (this.builder.lookAhead(2)?.isType(JsLexicalGrammar.LPAREN)) {
                this.parseClassMethodDefinition(start, isAsync);
            } else {
                if (isAsync) {
                    this.builder.popAndError("Class field cannot be async");
                }
                this.parseClassFieldDefinition(start);
            }
        } else if (next.isType(JsLexicalGrammar.MATHEMATICAL_OPERATOR) && next.getValue() === "*") {
            this.builder.advance(); // consume '*'
            if (this.builder.isNext(JsLexicalGrammar.LBRACKET))
                this.parseClassComputedPropertyMethod(start, isAsync, true);
            else
                this.parseClassMethodDefinition(start, isAsync, true);
        } else if (next.isType(JsLexicalGrammar.KEYWORD)) {
            if (isPrivateField) {
                this.builder.markErrorAndRemove(isPrivateField!, "Unexpected '#'");
            }
            if (next.getValue() === "constructor") {
                if (isAsync) {
                    this.builder.popAndError("Constructor cannot be async");
                }
                if (isStatic) {
                    this.builder.popAndError("Constructor cannot be static");
                }
                this.parseClassMethodDefinition(start, false);
            } else if (next.getValue() === "get" || next.getValue() === "set") {
                if (!this.builder.lookAhead(1)!.isType(JsLexicalGrammar.IDENTIFIER)) {
                    this.parseClassMethodDefinition(start, isAsync);
                } else {
                    if (isAsync) {
                        this.builder.popAndError("Getter/Setter cannot be async");
                    }
                    this.parseClassAccessor(start);
                }
            } else {
                this.builder.advance(); // consume the keyword
                this.builder.popAndError("Unexpected keyword in class body");
            }
        } else if (next.isType(JsLexicalGrammar.SEMICOLON)) {
            this.builder.advance(); // consume ';'
            start.done(JsGrammar.EmptyStatement);
        } else if (next.isType(JsLexicalGrammar.LBRACKET)) {
            this.parseClassComputedPropertyMethod(start, isAsync);
        } else {
            this.builder.advance(); // consume the token
            this.builder.popAndError("Unexpected token in class body");
        }

    }

    parseVariableStatement() {
        const marker = this.builder.mark();

        this.builder.advance(); // consume 'var' | 'let' | 'const'
        this.parseVariableDeclarationList();
        marker.done(JsGrammar.VariableDeclaration);
    }

    parseVariableDeclarationList() {
        if (this.builder.done()) {
            this.builder.error("Expected variable declaration");
            return;
        }
        do {
            this.myExprParser.parseVariableDeclarator();
        } while (!this.builder.done() && this.builder.consumeIf(JsLexicalGrammar.COMMA));
    }

    parseClassMethodDefinition(start: Marker, isAsync: boolean, isGenerator: boolean = false) {
        if (this.builder.consumeIf(JsLexicalGrammar.KEYWORD)) {
        } else {
            if (!this.builder.expect(JsLexicalGrammar.IDENTIFIER).orError("Method requires name")) {
                start.done(JsGrammar.ClassMethodDeclaration);
                return;
            }
        }
        this.builder.expect(JsLexicalGrammar.LPAREN).failWith("Expected '('")
            .then(() => this.myExprParser.parseFunctionArgumentDeclaration())
            .then(JsLexicalGrammar.RPAREN).failWith("Expected ')'")
            .then(() => this.parseBlock(true, true, isAsync, isGenerator, SynScopeType.Function));

        start.done(JsGrammar.ClassMethodDeclaration);
    }

    parseClassFieldDefinition(start: Marker) {
        this.builder.expect(JsLexicalGrammar.IDENTIFIER).failWith("Field requires name");
        if (this.builder.consumeIf(JsLexicalGrammar.ASSIGNMENT_OPERATOR, "=")) {
            this.parseExpression();
        }
        start.done(JsGrammar.ClassField);
    }

    parseClassComputedPropertyMethod(start: Marker, isAsync: boolean, isGenerator: boolean = false) {
        this.builder.expect(JsLexicalGrammar.LBRACKET).failWith("Expected '['")
            .then(() => this.parseExpression(false))
            .then(JsLexicalGrammar.RBRACKET).failWith("Expected ']'")
            .then(JsLexicalGrammar.LPAREN).failWith("Expected '('")
            .then(() => this.myExprParser.parseFunctionArgumentDeclaration())
            .then(JsLexicalGrammar.RPAREN).failWith("Expected ')'")
            .then(() => this.parseBlock(true, true, isAsync, isGenerator, SynScopeType.Function));

        start.done(JsGrammar.ClassMethodDeclaration);
    }

    parseClassAccessor(start: Marker) {
        this.builder.advance(); // consume 'get' | 'set'
        this.builder.expect(JsLexicalGrammar.IDENTIFIER).failWith("Accessor requires name")
            .then(JsLexicalGrammar.LPAREN).failWith("Expected '('")
            .then(() => {
                if (this.builder.lookBehind()!.getValue() === "set") {
                    this.myExprParser.parseFunctionArgumentDeclaration();
                }
            })
            .then(JsLexicalGrammar.RPAREN).failWith("Expected ')'")
            .then(() => this.parseBlock(true, false, false, false, SynScopeType.Function));
        start.done(JsGrammar.ClassMethodDeclaration);
    }

    private parseExpression(allowComma: boolean = true): void {
        this.myExprParser.parseExpression(allowComma);
    }

    private reportOutOfContextKeyword(msg: string) {
        this.builder.advance(); // consume the keyword
        this.builder.popAndError(msg); // Remove it from the tree and report error
    }
}
