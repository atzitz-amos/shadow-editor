import {Source, TokenStream} from "../tokens/TokenStream";
import {Token} from "../tokens/Token";
import {DocumentModificationEvent} from "../../../editor/core/document/events/DocumentModificationEvent";

/**
 * Represents a lexer interface for tokenizing source code.
 *
 * @author Atzitz Amos
 * @date 10/18/2025
 * @since 1.0.0
 */
export interface ILexer {
    relex(event: DocumentModificationEvent): void;

    lexAll(text: string): void;

    /**
     * Tokenize one character from the source given the LexerState
     *
     * @returns the tokenized token and the new lexer state
     * */
    tokenize(input: Source): Token;

    createTokenStream(): TokenStream;
}
