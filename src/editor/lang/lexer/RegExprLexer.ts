import {ILexer} from "./ILexer";
import {LazyTokenStream, Source, TokenStream} from "../tokens/TokenStream";
import {Token} from "../tokens/Token";
import {TokenType} from "../tokens/TokenType";
import {LexicalGrammar} from "./LexicalGrammar";
import {TextRange} from "../../core/coordinate/TextRange";

/**
 * Special Lexer that aims at simplifying the development of lexers by relying essentially on regular expressions.<br>
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

    public asTokenStream(input: string): TokenStream {
        return new LazyTokenStream(this, input);
    }

    tokenize(source: Source): Token {
        if (source.isEmpty()) {
            return new Token(TokenType.EOF, '', '', TextRange.tracked(source.index, source.index));
        }
        for (const tt of this.tokenTypes) {
            const match = tt.matcher.exec(source.getRemaining());
            if (match) {
                source.jump(match[0].length);
                const value = tt.getValue ? tt.getValue(match) : match[0];
                return new Token(
                    tt,
                    value,
                    match[0],
                    TextRange.tracked(source.index - match[0].length, source.index)
                );
            }
        }
        return Token.errorToken(source.consume()!, TextRange.tracked(source.index - 1, source.index));
    }
}