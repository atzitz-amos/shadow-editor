import {Source} from "../tokens/TokenStream";
import {ILexer} from "./ILexer";
import {Token} from "../tokens/Token";
import {DocumentModificationEvent} from "../../../../../editor/core/document/events/DocumentModificationEvent";
import {TokenCache} from "../../../../../editor/core/lang/TokenCache";
import {Document} from "../../../../../editor/core/document/Document";

/**
 * An abstract class for incremental lexers that support re-lexing of modified text ranges.
 *
 * @author Atzitz Amos
 * @date 10/18/2025
 * @since 1.0.0
 */
export abstract class IncrementalLexer implements ILexer {
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

    public lexAll(document: Document): void {
        const source = new Source(document.getTextContent(), 0);
        const tokens: Token[] = [];

        while (!source.isEmpty()) {
            tokens.push(this.tokenize(source));
        }

        document.getTokenCache().setTokens(tokens);
    }

    abstract tokenize(input: Source): Token;
}
