import {Source, TokenStream} from "../tokens/TokenStream";
import {Token} from "../tokens/Token";
import {TokenType} from "../tokens/TokenType";
import {LexicalGrammar} from "./LexicalGrammar";
import {TextRange} from "../../../../../editor/core/coordinate/TextRange";
import {ILexer} from "./ILexer";
import {DocumentModificationEvent} from "../../../../../editor/core/document/events/DocumentModificationEvent";

/**
 * Special Lexer that aims at simplifying the development of lexers by relying essentially on regular expressions.<br>
 *
 * @deprecated Prefer using handwritten lexers for better performance and flexibility.
 * **/
export class RegExpLexer implements ILexer {
    private readonly tokenTypes: TokenType[] = [];

    public constructor(grammar: Class<LexicalGrammar>) {
        for (let k in grammar) {
            if (grammar.hasOwnProperty(k)) {
                const tt = (grammar as any)[k];
                if (tt instanceof TokenType) {
                    this.tokenTypes.push(RegExpLexer._validate(tt));
                }
            }
        }

        this.tokenTypes.sort((a, b) => b.priority - a.priority);
    }

    public static _validate(tt: TokenType): TokenType {
        if (!tt.matcher.source.startsWith('^')) {
            tt.matcher = new RegExp('^(' + tt.matcher.source + ')', tt.matcher.flags);
        }
        return tt;
    }

    relex(event: DocumentModificationEvent): void {
        throw new Error("Method not implemented.");
    }

    createTokenStream(): TokenStream {
        throw new Error("Method not implemented");
    }

    public lexAll(input: string): Token[] {
        const source = new Source(input);
        const tokens: Token[] = [];
        let token: Token;
        while (!source.isEmpty()) {
            token = this.tokenize(source);
            tokens.push(token);
        }
        return tokens;
    }

    tokenize(source: Source): Token {
        if (source.isEmpty()) {
            return new Token(TokenType.EOF, '', new TextRange(source.index, source.index));
        }
        for (const tt of this.tokenTypes) {
            const match = tt.matcher.exec(source.getRemaining());
            if (match) {
                source.jump(match[0].length);
                const value = tt.getValue ? tt.getValue(match) : match[0];
                return new Token(
                    tt,
                    value,
                    new TextRange(source.index - match[0].length, source.index)
                );
            }
        }
        return Token.unexpected(source.consume()!, new TextRange(source.index - 1, source.index));
    }
}