import {Source, TokenStream} from "../tokens/TokenStream";
import {ILexer} from "./ILexer";
import {Token} from "../tokens/Token";
import {DocumentModificationEvent} from "../../../../../editor/core/document/events/DocumentModificationEvent";

/**
 * An abstract class for incremental lexers that support re-lexing of modified text ranges.
 *
 * @author Atzitz Amos
 * @date 10/18/2025
 * @since 1.0.0
 */
export abstract class IncrementalLexer implements ILexer {
    protected tokenStreams: TokenStream[] = [];

    public relex(event: DocumentModificationEvent): void {
        let cache = event.getDocument().getTokenCache();

        let startOffset = cache.findPreviousWhitespaceToken(event.getLocation());
        let endOffset = cache.findNextWhitespaceToken(event.getAffectedRange().end) + event.getInsertedText().length;
        let changedOffset = event.getInsertedText().length - event.getAffectedRange().getLength();

        const text = event.getDocument().substring(startOffset);
        const source = new Source(text, startOffset);

        const tokens: Token[] = [];

        while (!source.isEmpty()) {
            tokens.push(this.tokenize(source));

            if (source.getOffset() === endOffset) break;
            if (source.getOffset() > endOffset) {
                endOffset = cache.findNextWhitespaceToken(source.getOffset() + changedOffset) + changedOffset;
            }
        }

        cache.update(startOffset, endOffset - changedOffset, tokens, changedOffset);
    }

    public lexAll(text: string): void {
        // TODO
    }

    abstract tokenize(input: Source): Token;
}
