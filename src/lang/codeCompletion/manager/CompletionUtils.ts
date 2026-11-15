import {QuickParseUtils} from "../../syntax/utils/QuickParseUtils";
import {SynTokenNode} from "../../syntax/impl/SynTokenNode";
import {SynDocument} from "../../syntax/api/document/SynDocument";
import {SynTree} from "../../syntax/api/tree/SynTree";
import {SynNode} from "../../syntax/api/SynNode";
import {SynParentElement} from "../../syntax/api/tree/SynParentElement";
import {AbstractSynParentElement} from "../../syntax/impl/tree/AbstractSynParentElement";

/**
 * What the providers are given to compute completions.
 * <p>
 * `token` and `node` never belong to the document's own tree: they come from a reparse of the whole document
 * with a dummy identifier inserted at `at`. That is what makes the context the same whatever was typed so far:
 * `for|` is the identifier `forDUMMY` there, as `f|` was when the session opened by itself, and not the keyword
 * of a for statement.
 * <p>
 * Offsets before `at` are identical in both trees, so providers must resolve scope by walking up from `node`,
 * never by looking the offset up in the document's own tree.
 */
export type CompletionInfo = {
    /** The identifier being completed: the prefix, the dummy, and whatever part of the identifier is after `at` */
    token: SynTokenNode;
    /** The parent of `token` */
    node: SynParentElement;
    /** The text of the completion prefix, i.e. the part of the identifier before the caret */
    text: string;
    /** The offset the completion was requested at */
    at: Offset;
};

/**
 *
 * @author Atzitz Amos
 * @date 11/6/2026
 * @since 1.0.0
 */
export class CompletionUtils {
    private static readonly DUMMY_IDENTIFIER = "SHADOWDUMMYPLEASEDONTCALLAVARLIKETHAT";

    /**
     * Reparses the whole document with a dummy identifier inserted at `at` and returns the token it is part of,
     * or null if that is not an identifier made of the prefix starting at `prefixStart` followed by the dummy
     * (e.g. the dummy ended up inside a string).
     */
    public static reparseWithDummy(at: Offset, prefixStart: Offset, synDocument: SynDocument): SynTokenNode | null {
        const language = synDocument.getLanguage();
        if (!language) return null;

        const text = synDocument.getText();
        const newText = text.substring(0, at) + CompletionUtils.DUMMY_IDENTIFIER + text.substring(at);

        let tree: SynTree;
        try {
            tree = QuickParseUtils.quickParse(language, newText).tree;
        } catch (e) {
            return null; // the parse timed out
        }

        // The token starts exactly at `prefixStart`: 'right' is the only lean that is deterministic there
        const dummyToken = tree.getDeepestChildAt(prefixStart, 'right');
        if (!(dummyToken instanceof SynTokenNode)) return null;
        if (dummyToken.getTextRange().start !== prefixStart) return null;
        if (!dummyToken.getValue().startsWith(CompletionUtils.DUMMY_IDENTIFIER, at - prefixStart)) return null;

        return dummyToken;
    }

    /**
     * @param at the caret offset
     * @param synDocument the document, whose tree must be up to date
     * @param prefixStart the start of the session's prefix range, which ends at `at`
     */
    public static getCompletionInfo(at: Offset, synDocument: SynDocument, prefixStart: Offset): CompletionInfo | null {
        const prefix = synDocument.getText().substring(prefixStart, at);

        // No completions strictly inside a non-identifier token (`=|=`), except whitespace
        const left = CompletionUtils.getTokenAt(synDocument.getTree(), at, 'left');
        if (left && !left.token.getType().isIdentifier && !left.token.shouldSkip()
            && left.getTextRange().start < at && at < left.getTextRange().end) return null;

        const dummyToken = CompletionUtils.reparseWithDummy(at, prefixStart, synDocument);
        return dummyToken ? {
            token: dummyToken,
            node: CompletionUtils.getParentOrToplevel(dummyToken.getSynDocument().getTree(), dummyToken),
            text: prefix,
            at: at
        } : null;
    }

    /** The parent of `node`, or the toplevel codeblock of `tree` if it has none */
    public static getParentOrToplevel(tree: SynTree, node: SynNode | null): SynParentElement {
        const parent = node?.getParent();
        return parent instanceof AbstractSynParentElement ? parent : tree.getToplevelCodeblock();
    }

    /** The token containing `at`, or null when `at` is in a gap between tokens */
    private static getTokenAt(tree: SynTree, at: Offset, lean: 'left' | 'right'): SynTokenNode | null {
        const node = tree.getDeepestChildAt(at, lean);
        if (!(node instanceof SynTokenNode)) return null;

        const range = node.getTextRange();
        const contains = lean === 'left' ? range.start <= at && at <= range.end : range.start <= at && at < range.end;
        return contains ? node : null;
    }
}
