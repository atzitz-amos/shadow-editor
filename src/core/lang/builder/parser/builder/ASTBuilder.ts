import {TokenStream} from "../../tokens/TokenStream";
import {Token} from "../../tokens/Token";
import {Marker, TokenStreamMarker} from "./Marker";
import {SynTokenNode} from "../../syntax/impl/SynTokenNode";
import {TokenType} from "../../tokens/TokenType";
import {TextRange} from "../../../../../editor/core/coordinate/TextRange";
import {SynErrorNode} from "../../syntax/impl/SynErrorNode";
import {ASTGrammar, ASTType} from "../nodes/ASTGrammar";
import {TokenExpectation} from "./TokenExpectation";
import {SynNode} from "../../syntax/api/SynNode";
import {ASTNode} from "../nodes/ASTNode";
import {DefaultSynElement} from "../../syntax/impl/DefaultSynElement";

export class ASTBuilder {
    private readonly production: SynNode[] = [];
    private currentOffset: number = 0;

    private isErrorState: boolean = false;
    private wasInErrorState: boolean = false;

    constructor(private stream: TokenStream) {

    }

    getTokenAt(tokenOffset: number): Token | null {
        return this.stream.getAt(tokenOffset);
    }

    done(): boolean {
        this.clearWhitespace();
        return this.stream.isEmpty() || this.seek() === null;
    }

    seek(): Token | null {
        return this.lookAhead(0);
    }

    lookAhead(n: number): Token | null {
        let token: Token | null = this.stream.seekN(n);
        while (token && (token.isCommentToken() || token.shouldSkip())) {
            token = this.stream.seekN(++n);
        }
        if (token?.isType(TokenType.EOF))
            return null;
        return token;
    }

    lookBehind(): Token | null {
        let token: Token | null = this.stream.seekN(-1);
        let n = -1;
        while (token && (token.isCommentToken() || token.shouldSkip())) {
            token = this.stream.seekN(--n);
        }
        return token;
    }

    mark(): Marker {
        this.clearWhitespace();
        return new TokenStreamMarker(this, this.currentOffset, this.stream.getIndex(), this.production.length, this.isErrorState)
    }

    rollbackTo(marker: Marker): void {
        this.currentOffset = marker.getOffset();
        this.stream.rollbackTo(marker.getTokenIndex());

        for (let i = 0; i < this.production.length;) {
            const ast = this.production[i];
            if (ast.getTextRange().start >= this.currentOffset) {
                this.production.pop();
            } else {
                i++;
            }
        }

        this.isErrorState = marker.wasErrorAt();
    }

    advance(shouldAppend = true): Token | null {
        const token = this.stream.consume();
        if (!token) {
            return null;
        }
        this.currentOffset = token.getRange().end;
        if (shouldAppend && !token.shouldSkip())
            this.production.push(new SynTokenNode(token));
        if (token.isCommentToken() || token.shouldSkip()) {
            return this.advance(shouldAppend);
        }
        return token;
    }

    consumeIf(type: TokenType, value: string | null = null, shouldAppend: boolean = true): Token | null {
        if (this.isNext(type, value)) {
            return this.advance(shouldAppend);
        }
        return null;
    }

    consumeIfOneOf(type: TokenType, ...values: string[]): Token | null {
        let next = this.seek();
        if (next !== null && next.isType(type) && values.includes(next.getValue())) {
            return this.advance();
        }
        return null;
    }

    isNext(type: TokenType, value: string | null = null) {
        let next = this.seek();
        return next !== null && next.isType(type) && (!value || next.getValue() === value);
    }

    expect(type: TokenType, value: string | null = null, shouldConsumeOnError: boolean = false): TokenExpectation {
        if (this.isNext(type, value)) {
            return new TokenExpectation(this, this.advance(), true);
        }

        this.isErrorState = true;
        if (shouldConsumeOnError) {
            let tok = this.advance(false);
            return new TokenExpectation(this, tok, false);
        }
        return new TokenExpectation(this, null, false);
    }

    error(msg: string) {
        this.isErrorState = true;
        this.production.push(new SynErrorNode(new TextRange(this.currentOffset, this.currentOffset), msg));
    }

    errorBefore(token: Token, msg: string) {
        this.isErrorState = true;
        this.production.push(new SynErrorNode(new TextRange(token.getRange().start, token.getRange().start), msg));
    }

    errorOn(token: Token, msg: string) {
        this.isErrorState = true;
        this.production.push(new SynErrorNode(token.getRange(), msg));
    }

    markErrorAndRemove(token: Token, msg: string) {
        for (let i = this.production.length - 1; i >= 0; i--) {
            const ast = this.production[i];
            if (ast.getTextRange().is(token.getRange())) {
                this.production.splice(i, 1);
                this.isErrorState = true;
                this.production.push(new SynErrorNode(token.getRange(), msg));
                return;
            }
        }
    }

    popAndError(msg: string) {
        this.isErrorState = true;
        this.production.push(new SynErrorNode(this.production.pop()!.getTextRange(), msg));
    }

    errorAt(range: TextRange, msg: string) {
        this.isErrorState = true;
        this.production.push(new SynErrorNode(range, msg));
    }

    build(marker: Marker, type: ASTType) {
        const range = new TextRange(marker.getOffset(), this.currentOffset);
        const children = this.production.splice(marker.getBuilderOffset(), this.production.length - marker.getBuilderOffset());
        if (children.length === 1 && type === ASTGrammar.Expression)
            this.production.push(children[0]);
        else
            this.addToProduction(type, children, range);
        this.wasInErrorState = this.isErrorState;
        this.isErrorState = false;
    }

    add(type: ASTType) {
        this.addToProduction(type, [], new TextRange(this.currentOffset, this.currentOffset));
    }

    addToProduction(type: ASTType, children: SynNode[], range: TextRange) {
        const node = new ASTNode(type, children, range);
        if (type.treeBuilder) {
            this.production.push(type.treeBuilder(node));
        } else {
            this.production.push(new DefaultSynElement(node));
        }
    }

    clearWhitespace() {
        let token: Token | null;
        while ((token = this.stream.seek()) && (token.shouldSkip() || token.isCommentToken())) {
            this.currentOffset = token.getRange().end;
            this.stream.consume();
            if (token.isCommentToken())
                this.production.push(new SynTokenNode(token));
        }
    }

    getProduction() {
        return this.production;
    }

    beforeNewLine() {
        return this.stream.seek()?.getValue() === "\n";
    }

    wasInvalid() {
        return this.wasInErrorState;
    }
}