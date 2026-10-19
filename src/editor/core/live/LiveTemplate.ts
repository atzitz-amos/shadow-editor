import {TextRange} from "../coordinate/range/TextRange";
import {LiveTemplateMode} from "./LiveTemplateMode";
import {Editor} from "../../Editor";
import {TrackedRange} from "../coordinate/range/TrackedRange";

/**
 *
 * @author Atzitz Amos
 * @date 9/28/2026
 * @since 1.0.0
 */
export class LiveTemplate {
    private readonly mode: LiveTemplateMode;

    constructor(private readonly editor: Editor, private readonly range: TextRange, private readonly links: TextRange[]) {
        this.mode = new LiveTemplateMode(range);

        const trackedRanges = links.map(link => {
            const tracked = new TrackedRange(link.getStart(), link.getEnd(), true, true)
            editor.getOpenedDocument().addTrackedRange(tracked);
            return tracked;
        });

        this.mode.setTemplateModifiedCallback((doc, range) => {
            const newText = doc.getTextBetween(range.start, range.end);
            for (const trackedRange of trackedRanges) {
                if (!trackedRange.isValid()) continue;
                doc.replaceRange(trackedRange, newText);
            }
        });
    }

    start() {
        const stack = this.editor.getOpenedDocument().getUndoRedoStack();
        stack.startUndoableAction(this.editor, "Live Template", false);
        this.editor.getBehaviorManager().enterMode(this.mode);

        this.editor.getPrimaryCaret().selectionModel.select(this.range.start, this.range.end);

        this.mode.setTemplateRejectedCallback(() => {
            stack.finishUndoableAction(this.editor);
            const frame = stack.discardFrame();
            if (frame) stack.undoFrame(this.editor, frame);
            this.editor.repaintView();
        });

        this.mode.setTemplateAcceptedCallback(() => {
            stack.finishUndoableAction(this.editor);
        })
    }
}
