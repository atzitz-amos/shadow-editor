import {Document} from "../Document";
import {Caret, CaretMovementFlags} from "../../caret/Caret";
import {TrackedRange} from "../../../../core/text/range/TrackedRange";
import {UndoStack} from "../../undo/UndoStack";

/**
 *
 * @author Atzitz Amos
 * @date 9/3/2026
 * @since 1.0.0
 */
export class DocumentModificationUtils {
    public static modifyWithCaret(document: Document, caret: Caret, undoStackFrame: string | null, callback: () => void, isTransparent: boolean = false) {
        if (undoStackFrame) {
            UndoStack.undoableAction(caret.editor, undoStackFrame, () => this.doModifyWithCaret(document, caret, callback), isTransparent);
        } else {
            this.doModifyWithCaret(document, caret, callback);
        }
    }

    /**
     * A JUMP leaves the selection alone, including its anchor, which is where the next shift + move starts
     * selecting from. Without a selection to preserve, the anchor has to follow the caret.
     */
    public static resetSelectionAnchor(caret: Caret) {
        const selection = caret.getSelectionModel();
        if (!selection.isSelectionActive) selection.clear();
    }

    private static doModifyWithCaret(document: Document, caret: Caret, callback: () => void) {
        const offset = caret.getOffset();
        const trackedRange = new TrackedRange(offset, offset, false, true);
        document.addTrackedRange(trackedRange);

        callback();

        if (!trackedRange.isValid())
            caret.moveToOffset(0, CaretMovementFlags.JUMP);
        else
            caret.moveToOffset(trackedRange.getEnd(), CaretMovementFlags.JUMP);
        trackedRange.invalidate();
        this.resetSelectionAnchor(caret);

        caret.editor.getView().resetBlink();
    }
}
