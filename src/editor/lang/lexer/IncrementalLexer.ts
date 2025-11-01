import {Source, StaticTokenStream, TokenStream} from "../tokens/TokenStream";
import {ILexer} from "./ILexer";
import {TokenCache} from "../../core/lang/TokenCache";
import {Token} from "../tokens/Token";
import {DocumentModificationEvent} from "../../core/document/events/DocumentModificationEvent";

/**
 * An abstract class for incremental lexers that support re-lexing of modified text ranges.
 *
 * @author Atzitz Amos
 * @date 10/18/2025
 * @since 1.0.0
 */
export abstract class IncrementalLexer implements ILexer {
    protected cache: TokenCache = new TokenCache();
    protected tokenStreams: TokenStream[] = [];

    public relex(event: DocumentModificationEvent): void {
        this.invalidate();

        let startOffset = this.cache.findPreviousWhitespaceToken(event.getLocation());
        let endOffset = this.cache.findNextWhitespaceToken(event.getAffectedRange().end) + event.getInsertedText().length;
        let changedOffset = event.getInsertedText().length - event.getAffectedRange().getLength();

        const text = event.getDocument().getTextContent().substring(startOffset);
        const source = new Source(text, startOffset);

        const tokens: Token[] = [];

        while (!source.isEmpty()) {
            tokens.push(this.tokenize(source));

            if (source.getOffset() === endOffset) break;
            if (source.getOffset() > endOffset) {
                endOffset = this.cache.findNextWhitespaceToken(source.getOffset() + changedOffset) + changedOffset;
            }
        }

        this.cache.update(startOffset, endOffset - changedOffset, tokens, changedOffset);
    }

    public lexAll(text: string): void {
        this.invalidate();

        // TODO
    }

    public createTokenStream(): TokenStream {
        const stream = new StaticTokenStream(this.cache.getTokens());
        this.tokenStreams.push(stream);
        return stream;
    }

    abstract tokenize(input: Source): Token;

    public invalidate(): void {
        for (const stream of this.tokenStreams) {
            console.log(1);
            stream.invalidate();
        }

        this.tokenStreams = [];
    }
}
