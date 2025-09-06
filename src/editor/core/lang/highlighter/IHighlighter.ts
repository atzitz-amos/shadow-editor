import {Token, TokenStream} from "../lexer/TokenStream";
import {HighlightedToken} from "./HighlightedToken";


/**
 * Base interface for Highlighters*/
export interface IHighlighter<T> {
    /**
     * Highlights the given token stream and returns an array of highlighted tokens.
     * @param stream The input token stream to highlight.
     * @returns An array of highlighted tokens.
     */
    highlight(stream: TokenStream<T>): Iterable<HighlightedToken>;

    computeLineBreaks?(stream: TokenStream<T>): number[];
}

/**
 * Add visitor functions
 * All VisitorHighlighter must implement this interface. */


/**
 * Rather than returning an iterable, returns a generator for lazy computation.
 * The usage of this class is highly recommended. */
export interface LazyHighlighter<T> extends IHighlighter<T> {
    /**
     * Lazily highlights the given token stream and returns a generator for the highlighted tokens.
     * @param stream The input token stream to highlight.
     * @returns A generator for the highlighted tokens.
     */
    highlight(stream: TokenStream<T>): Generator<HighlightedToken>
}


/**
 * The VisitorHighlighterImplementor<TokenType, HighlightType> */
export type VisitorHighlighterImplementor<T extends string> = {
    [key in T as `visit${key}`]: (token: Token<T>) => HighlightedToken | null;
}


/**
 * The Visitor Highlighter. Will invoke the visitXXX methods on `_impl` as it lazily traverses the tokens. */
export abstract class VisitorHighlighter<T extends string>
    implements LazyHighlighter<T> {

    /**
     * The Visitor implementor. Usually set to `this` by subclasses */
    protected abstract _impl: VisitorHighlighterImplementor<T>;

    * highlight(stream: TokenStream<T>): Generator<HighlightedToken> {
        while (!stream.isEmpty()) {
            const token = stream.consume();
            if (token) {
                const visitMethod = this._impl[`visit${token.type}`] as (token: Token<T>) => HighlightedToken | null;
                let ht = visitMethod(token);
                if (ht)
                    yield ht;
            }
        }
    }
}
