import {SynDocument} from "../../syntax/api/document/SynDocument";
import {SynModificationRecord} from "./SynModificationRecord";
import {SynNode} from "../../syntax/api/SynNode";
import {AbstractSynTemplate} from "../template/AbstractSynTemplate";
import {TextRange} from "../../../editor/core/coordinate/range/TextRange";

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

    constructor(private readonly synDocument: SynDocument) {
    }

    /**
     * Replaces `node`'s text with `template`'s resolved text.
     */
    replaceNode(node: SynNode, template: AbstractSynTemplate): void {
        this.applyModification(node.getTextRange(), template.getText());
    }

    /**
     * Replaces `node`'s text with a plain string.
     */
    replaceNodeWithText(node: SynNode, text: string): void {
        this.applyModification(node.getTextRange(), text);
    }

    /**
     * Deletes `node`'s text entirely (equivalent to replacing it with "").
     */
    deleteNode(node: SynNode): void {
        this.applyModification(node.getTextRange(), "");
    }

    getModifications(): SynModificationRecord[] {
        return this.modifications;
    }

    /**
     * Shared logic: modifications operate on the old version of the document, so a new one
     * is checked for overlap against every existing modification and then shifted by the
     * cumulative length delta of every modification that lies fully before it, so all
     * modifications can be applied in document order.
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