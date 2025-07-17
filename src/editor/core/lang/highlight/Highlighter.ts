import {Token, TokenStream} from "../lexer/TokenStream";
import {IHighlightedToken} from "./HighlightedToken";


/**
 * Base interface for Highlighters*/
export interface IHighlighter<T, H extends IHighlightedToken> {
    /**
     * Highlights the given token stream and returns an array of highlighted tokens.
     * @param stream The input token stream to highlight.
     * @returns An array of highlighted tokens.
     */
    highlight(stream: TokenStream<T>): Iterable<H>;

    computeLineBreaks?(stream: TokenStream<T>): number[];
}

/**
 * Add visitor functions
 * All VisitorHighlighter must implement this interface. */


/**
 * Rather than returning an iterable, returns a generator for lazy computation.
 * The usage of this class is highly recommended. */
export interface LazyHighlighter<T, H extends IHighlightedToken> extends IHighlighter<T, H> {
    /**
     * Lazily highlights the given token stream and returns a generator for the highlighted tokens.
     * @param stream The input token stream to highlight.
     * @returns A generator for the highlighted tokens.
     */
    highlight(stream: TokenStream<T>): Generator<H>
}


/**
 * The VisitorHighlighterImplementor<TokenType, HighlightType> */
export type VisitorHighlighterImplementor<T extends string, H> = {
    [key in T as `visit${key}`]: (token: Token<T>) => H | null;
}


/**
 * The Visitor Highlighter. Will invoke the visitXXX methods on `_impl` as it lazily traverses the tokens. */
export abstract class VisitorHighlighter<T extends string, H extends IHighlightedToken>
    implements LazyHighlighter<T, H> {

    /**
     * The Visitor implementor. Usually set to `this` by subclasses */
    protected abstract _impl: VisitorHighlighterImplementor<T, H>;

    * highlight(stream: TokenStream<T>): Generator<H> {
        while (!stream.isEmpty()) {
            const token = stream.consume();
            if (token) {
                const visitMethod = this._impl[`visit${token.type}`] as (token: Token<T>) => H;
                yield visitMethod(token);
            }
        }
    }
}
