import {Source, TokenStream} from "../tokens/TokenStream";
import {Token} from "../tokens/Token";

export interface ILexer {
    /**
     * Tokenizes the input string into an array of tokens. As a default, it will skip special characters like whitespaces or newlines or comments.
     * @param input The input string to tokenize.
     * @returns The associated TokenStream
     */
    asTokenStream(input: string): TokenStream;

    /**
     * Tokenizes the source object and returns a single token.<br>
     *  *Should only be used by TokenStream's implementations.*
     * @param source The source object to tokenize.
     * @returns The token generated from the source.
     */
    tokenize(source: Source): Token;
}