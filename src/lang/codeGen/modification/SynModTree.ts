import {SynModificationRecord} from "./SynModificationRecord";
import {SynNode} from "../../syntax/api/SynNode";
import {AbstractSynTemplate} from "../template/AbstractSynTemplate";
import {TextRange} from "../../../core/text/range/TextRange";
import {SynTree} from "../../syntax/api/tree/SynTree";
import {SynPlaceholder} from "../placeholder/SynPlaceholder";

/**
 *
 * @author Atzitz Amos
 * @date 9/24/2026
 * @since 1.0.0
 */
export class SynModTree {
    private readonly modifications: SynModificationRecord[] = [];

    /**
     * Parallel to `modifications`: the original (old-document) range of each replacement
     * and how much it changes the document length. Used to validate and shift new replacements.
     */
    private readonly originals: { start: number, end: number, lengthDelta: number }[] = [];

    constructor(private readonly tree: SynTree) {
    }

    /**
     * Replaces `node`'s text with `template`'s resolved text.
     */
    replaceNode(node: SynNode, template: AbstractSynTemplate): void {
        this.applyModification(node.getTextRange(), template.getText());
    }

    getText(): string {
        let text = this.tree.getText();
        for (const modification of this.modifications) {
            text = text.slice(0, modification.range.start) + modification.text + text.slice(modification.range.end);
        }
        return text;
    }

    /**
     * Replaces `node`'s text with a plain string.
     */
    replaceNodeWithText(node: SynNode, text: string): void {
        this.applyModification(node.getTextRange(), text);
    }

    replacePlaceholder(placeholder: SynPlaceholder, template: AbstractSynTemplate): void {
        this.applyModification(placeholder.getTextRange(), template.getText());
    }

    replacePlaceholderWithText(placeholder: SynPlaceholder, text: string): void {
        this.applyModification(placeholder.getTextRange(), text);
    }

    /**
     * Deletes `node`'s text entirely (equivalent to replacing it with "").
     */
    deleteNode(node: SynNode): void {
        this.applyModification(node.getTextRange(), "");
    }

    /**
     * The modifications, in the order they were recorded. They must be applied in that order and no other: each
     * range is already shifted by the length change of the modifications recorded before it.
     */
    getModifications(): SynModificationRecord[] {
        return this.modifications;
    }

    /**
     * Shared logic: modifications operate on the old version of the document, so a new one
     * is shifted by the cumulative length delta of every existing modification that lies fully
     * before it, so that all modifications can be applied in the order they were recorded.
     * <p>
     * Overlapping modifications are NOT checked for: it is up to the caller not to record any.
     */
    private applyModification(range: TextRange, text: string): void {
        const start = range.start;
        const end = range.end;

        let shift = 0;
        for (const prev of this.originals) {
            if (prev.end <= start) {
                shift += prev.lengthDelta;
            }
        }

        this.originals.push({start, end, lengthDelta: text.length - (end - start)});
        this.modifications.push({range: range.delta(shift), text});
    }
}