import {TokenStream} from "../tokens/TokenStream";
import {DocumentModificationEvent} from "../../../../editor/core/document/events/DocumentModificationEvent";
import {Document} from "../../../../editor/core/document/Document";
import {TextRange} from "../../../../editor/core/coordinate/range/TextRange";

/**
 * Represents a lexer interface for tokenizing source code.
 *
 * @author Atzitz Amos
 * @date 10/18/2025
 * @since 1.0.0
 */
export interface ILexer {
    relex(event: DocumentModificationEvent): TextRange;

    lexAll(document: Document): void;

    lexAllToTokens(text: string): TokenStream;
}
