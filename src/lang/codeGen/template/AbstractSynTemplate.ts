import {SynASTElement} from "../../syntax/api/tree/SynASTElement";
import {SynModificationRecord} from "../modification/SynModificationRecord";
import {LanguageBase} from "../../LanguageBase";
import {TextRange} from "../../../editor/core/coordinate/range/TextRange";

export interface TemplateModificationObserver {
    onTemplateChanged(template: AbstractSynTemplate, mod: SynModificationRecord): void;
}

/**
 *
 * @author Atzitz Amos
 * @date 9/24/2026
 * @since 1.0.0
 */
export abstract class AbstractSynTemplate implements TemplateModificationObserver {
    /**
     * Modifications with their ranges shifted so that they can be executed in insertion order.
     */
    protected readonly modifications: SynModificationRecord[] = [];

    /**
     * Parallel to `modifications`: the original (old-document) range of each modification
     * and how much it changes the document length. Used to validate and shift new modifications.
     */
    private readonly originals: { start: number, end: number, lengthDelta: number }[] = [];

    private readonly liveRanges: TextRange[] = [];

    private readonly observers: TemplateModificationObserver[] = [];

    constructor(protected readonly element: SynASTElement) {
    }

    abstract getLanguage(): LanguageBase;

    /**
     * Called when a child template (one we observe) records a modification.
     * The modification is translated into our coordinate space and recorded through
     * modify(), which gives us overlap checks, shifting and propagation to our own observers.
     */
    onTemplateChanged(template: AbstractSynTemplate, mod: SynModificationRecord): void {
        const offset = template.element.getTextRange().start - this.element.getTextRange().start;
        this.modify(mod.range.delta(offset), mod.text);
    }

    getModifications(relativeOffset: number): SynModificationRecord[] {
        return this.modifications.map(mod => ({
            range: mod.range.delta(relativeOffset),
            text: mod.text
        }));
    }

    addObserver(observer: TemplateModificationObserver): void {
        this.observers.push(observer);
    }

    /**
     * Resolves the text this template produces: the element's original text
     * with all modifications applied in order.
     */
    getText(): string {
        let text = this.element.getText();

        for (const mod of this.getModifications(0)) {
            text = text.slice(0, mod.range.start) + mod.text + text.slice(mod.range.end);
        }
        return text;
    }

    getElement(): SynASTElement {
        return this.element;
    }


    /**
     * Modifications operate on the old version of the document, so new ones are checked for
     * overlaps with existing modifications and shifted so that they can be executed in sequence.
     * E.g. after replacing [0, 5] with "H", any modification inside [0, 5] throws,
     * while an insert of "ello" at [5, 5] is shifted to an insert at [1, 1].
     */
    modify(range: TextRange, text: string): TextRange {
        const start = range.start;
        const end = range.end;

        let shift = 0;
        for (const prev of this.originals) {
            // Overlap check. Also handles inserts (empty ranges): an insert conflicts only if it
            // lies strictly inside another modification's range; touching a boundary is fine.
            if (prev.start < end && start < prev.end) {
                throw new Error(
                    `Modification [${start}, ${end}] overlaps with existing modification [${prev.start}, ${prev.end}]`
                );
            }

            if (prev.end <= start) {
                shift += prev.lengthDelta;
            }
        }

        this.notifyChanged({range, text});

        this.originals.push({start, end, lengthDelta: text.length - (end - start)});
        this.modifications.push({range: range.delta(shift), text});

        return range.delta(shift);
    }

    protected insertTemplate(offset: number, template: AbstractSynTemplate): void {
        this.modify(new TextRange(offset, offset), template.getText());
    }

    private notifyChanged(mod: SynModificationRecord): void {
        for (const observer of this.observers) {
            observer.onTemplateChanged(this, mod);
        }
    }
}