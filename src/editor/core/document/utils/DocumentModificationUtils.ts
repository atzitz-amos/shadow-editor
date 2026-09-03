import {Document} from "../Document";
import {Caret, CaretMovementFlags} from "../../caret/Caret";
import {TrackedRange} from "../../coordinate/range/TrackedRange";
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

    private static doModifyWithCaret(document: Document, caret: Caret, callback: () => void) {
        const offset = caret.getOffset();
        const trackedRange = new TrackedRange(offset, offset, false, true);
        document.addTrackedRange(trackedRange);

        callback();

        caret.moveToOffset(trackedRange.getEnd(), CaretMovementFlags.JUMP);
        trackedRange.invalidate();

        caret.editor.getView().resetBlink();
    }
}
