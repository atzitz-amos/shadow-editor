import {Source, Token, TokenStream} from "./TokenStream";
import {ILexer} from "./ILexer";
import {TextRange} from "../../coordinate/TextRange";

export type RegExpTokenType<Type> = {
    type: Type,
    matcher: RegExp,
    getValue?: (match: string) => string,
    isSpecial?: boolean,
    isComment?: boolean
}


/**
 * Special Lexer that aims at simplifying the development of lexers by relying essentially on regular expressions.<br>
 * **/
export abstract class RegExpLexer<Type> implements ILexer<Type> {
    EOF: Type;
    compiledMatchers: RegExpTokenType<Type>[];
    specialChars: Type[] = [];
    comments: Type[] = [];

    setRules(rules: RegExpTokenType<Type>[]) {
        this.compiledMatchers = rules.map(({matcher, type, getValue}) => ({
            matcher: new RegExp(matcher.source, "y"),
            type,
            getValue,
        }));
    }

    setEOF(type: Type) {
        this.EOF = type;
    }

    setSpecial(...specialChars: Type[]) {
        this.specialChars = specialChars;
    }

    setComments(...comments: Type[]) {
        this.comments = comments;
    }


    abstract asTokenStream(input: string): TokenStream<Type>;

    tokenize(source: Source): Token<Type> {
        if (source.isEmpty()) {
            return new Token(this.EOF, '', TextRange.tracked(source.index, source.index), false, false);
        }
        for (const tt of this.compiledMatchers) {
            tt.matcher.lastIndex = source.index;
            const match = tt.matcher.exec(source.src);
            if (match) {
                source.jump(match[0].length);
                if (tt.type !== null) {  // If type == null, it means the token should be skipped
                    const value = tt.getValue ? tt.getValue(match[0]) : match[0];
                    const isSpecial = this.specialChars.includes(tt.type);
                    const isComment = this.comments.includes(tt.type);
                    return new Token(
                        tt.type,
                        value,
                        TextRange.tracked(source.index - match[0].length, source.index),
                        isSpecial,
                        isComment
                    );
                }
            }
        }
        throw "Unexpected token at index " + source.index + " in source: " + source.src;
    }
}