import {TokenStream} from "../../tokens/TokenStream";
import {Token} from "../../tokens/Token";
import {Marker, TokenStreamMarker} from "./Marker";
import {ASTNode} from "../nodes/ASTNode";
import {ASTTokenNode} from "../nodes/ASTTokenNode";
import {TokenType} from "../../tokens/TokenType";
import {TextRange} from "../../../core/coordinate/TextRange";
import {ASTErrorNode} from "../nodes/ASTErrorNode";
import {ASTType} from "../ASTGrammar";
import {ASTElementNode} from "../nodes/ASTElementNode";
import {TokenExpectation} from "./TokenExpectation";

export class ASTBuilder {
    private readonly production: ASTNode[] = [];
    private currentOffset: number = 0;

    constructor(private stream: TokenStream) {

    }

    getTokenAt(tokenOffset: number): Token | null {
        return this.stream.getAt(tokenOffset);
    }

    done(): boolean {
        return this.stream.isEmpty();
    }

    seek(): Token | null {
        return this.lookAhead(0);
    }

    lookAhead(n: number): Token | null {
        let token: Token | null = this.stream.seekN(n);
        while (token && (token.isCommentToken() || token.shouldSkip())) {
            token = this.stream.seekN(++n);
        }
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
        let token: Token | null;
        while ((token = this.stream.seek()) && (token.shouldSkip() || token.isCommentToken())) {
            this.currentOffset = token.getRange().end;
            this.stream.consume();
            if (token.isCommentToken())
                this.production.push(new ASTTokenNode(token));
        }
        return new TokenStreamMarker(this, this.currentOffset, this.stream.getIndex(), this.production.length)
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
    }

    advance(shouldAppend = true): Token | null {
        const token = this.stream.consume();
        if (!token) {
            return null;
        }
        this.currentOffset = token.getRange().end;
        if (shouldAppend && !token.shouldSkip())
            this.production.push(new ASTTokenNode(token));
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
        if (shouldConsumeOnError) {
            let tok = this.advance(false);
            return new TokenExpectation(this, tok, false);
        }
        return new TokenExpectation(this, null, false);
    }

    error(msg: string) {
        this.production.push(new ASTErrorNode(TextRange.tracked(this.currentOffset, this.currentOffset), msg));
    }

    errorBefore(token: Token, msg: string) {
        this.production.push(new ASTErrorNode(TextRange.tracked(token.getRange().start, token.getRange().start), msg));
    }

    errorOn(token: Token, msg: string) {
        this.production.push(new ASTErrorNode(token.getRange(), msg));
    }

    errorAt(range: TextRange, msg: string) {
        this.production.push(new ASTErrorNode(range, msg));
    }

    build(marker: Marker, type: ASTType) {
        const range = TextRange.tracked(marker.getOffset(), this.currentOffset);
        const children = this.production.splice(marker.getBuilderOffset(), this.production.length - marker.getBuilderOffset());
        if (children.length === 1)
            this.production.push(children[0]);
        else
            this.production.push(new ASTElementNode(type, children, range));
    }

    add(type: ASTType) {
        this.production.push(new ASTElementNode(type, [], TextRange.tracked(this.currentOffset, this.currentOffset)));
    }
}