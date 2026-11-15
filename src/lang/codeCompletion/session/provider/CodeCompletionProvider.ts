import {LanguageBase} from "../../../LanguageBase";
import {SynParentElement} from "../../../syntax/api/tree/SynParentElement";
import {SynTokenNode} from "../../../syntax/impl/SynTokenNode";
import {CodeCompletionItem} from "../../item/CodeCompletionItem";
import type {CompletionInfo} from "../../manager/CompletionUtils";

/**
 *
 * @author Atzitz Amos
 * @date 10/25/2026
 * @since 1.0.0
 */
export abstract class CodeCompletionProvider {
    abstract getApplicableLanguages(): LanguageBase[];

    /**
     * @param parent the parent of `placeholder`. Both may belong to a reparsed copy of the document's tree (see
     * {@link CompletionInfo}): resolve scope by walking up from `parent`, not from the document's own tree.
     * @param placeholder the identifier being completed
     * @param text the part of the identifier that is before the caret
     */
    abstract isApplicable(parent: SynParentElement, placeholder: SynTokenNode, text: string): boolean;

    /**
     * Returns every completion that makes sense at `placeholder`, NOT only the ones matching `text`: the session
     * filters them with {@link CodeCompletionItem.isStillApplicable} as the user types, and deleting characters
     * brings back the ones that did not match at first.
     */
    abstract getCompletionItems(parent: SynParentElement, placeholder: SynTokenNode, text: string): CodeCompletionItem[];
}

