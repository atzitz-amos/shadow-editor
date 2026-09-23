import {Source, StaticTokenStream, TokenStream} from "../tokens/TokenStream";
import {ILexer} from "./ILexer";
import {Token} from "../tokens/Token";
import {DocumentModificationEvent} from "../../../../editor/core/document/events/DocumentModificationEvent";
import {Document} from "../../../../editor/core/document/Document";
import {TextRange} from "../../../../editor/core/coordinate/range/TextRange";
import {LexerState} from "./stateful/LexerState";

/**
 * An abstract class for stateful lexers that track lexer state (e.g. for
 * context-sensitive tokenization such as string interpolation or nested
 * modes) across tokenize calls, and support re-lexing of modified text ranges.
 *
 * @author Atzitz Amos
 * @date 9/22/2026
 * @since 1.0.0
 */
export abstract class StatefulLexer implements ILexer {
    public relex(event: DocumentModificationEvent): TextRange {
        let cache = event.getDocument().getTokenCache();

        let endOffset = event.getDocument().getTotalDocumentLength();
        let changedOffset = event.getTextDelta();

        const text = event.getDocument().substring(0);
        const source = new Source(text, 0);

        const tokens: Token[] = [];

        const state = new LexerState();

        while (!source.isEmpty()) {
            let token = this.tokenize(source, state);
            tokens.push(token);
        }

        return cache.update(0, endOffset - changedOffset, tokens, changedOffset);
    }

    public lexAll(document: Document): void {
        const source = new Source(document.getTextContent(), 0);
        const tokens: Token[] = [];

        const state = new LexerState();

        while (!source.isEmpty()) {
            tokens.push(this.tokenize(source, state));
        }

        document.getTokenCache().setTokens(tokens);
    }

    public lexAllToTokens(text: string): TokenStream {
        const source = new Source(text, 0);
        const tokens: Token[] = [];

        const state = new LexerState();

        while (!source.isEmpty()) {
            tokens.push(this.tokenize(source, state));
        }

        return new StaticTokenStream(tokens);
    }

    /**
     * Tokenize one token from the source given the current LexerState.
     * Implementations are expected to call state.enter(...)/state.exit()
     * as needed to push/pop lexer modes.
     *
     * @returns the tokenized token
     */
    abstract tokenize(input: Source, state: LexerState): Token;

    createTokenStream(src: string): TokenStream {
        const source = new Source(src, 0);
        const tokens: Token[] = [];

        const state = new LexerState();

        while (!source.isEmpty()) {
            tokens.push(this.tokenize(source, state));
        }

        return new StaticTokenStream(tokens);
    }
}