import {BehaviorHandlingMode} from "../../../core/behaviors/manager/BehaviorHandlingMode";
import {CharTypedBehavior} from "../../../core/behaviors/behavior/CharTypedBehavior";
import {EditorCharTypedContext} from "../../../core/behaviors/context/EditorCharTypedContext";
import {UndoStack} from "../../../core/undo/UndoStack";

/**
 *
 * @author Atzitz Amos
 * @date 6/10/2026
 * @since 1.0.0
 */
export class DefaultCharTypedBehavior extends CharTypedBehavior {
    invoke(context: EditorCharTypedContext): BehaviorHandlingMode {
        const caret = context.getCaret();
        const editor = context.getEditor();

        UndoStack.undoableAction(editor, "type", () => {
            if (caret.getSelectionModel().isSelectionActive) {
                editor.deleteSelection(caret);
            }

            let offset = caret.getOffset();
            editor.insertText(offset, context.getContent())

            if (context.shouldMoveCaret()) {
                caret.moveToOffset(offset + context.getContent().length);
                caret.refresh();
            }
        }, true);

        editor.getView().resetBlink();

        return BehaviorHandlingMode.HANDLED;
    }
}
