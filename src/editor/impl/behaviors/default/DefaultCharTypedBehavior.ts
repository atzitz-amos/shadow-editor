import {BehaviorHandlingMode} from "../../../core/behaviors/manager/BehaviorHandlingMode";
import {CharTypedBehavior} from "../../../core/behaviors/behavior/CharTypedBehavior";
import {EditorCharTypedContext} from "../../../core/behaviors/context/EditorCharTypedContext";

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

        if (caret.getSelectionModel().isSelectionActive) {
            editor.deleteSelection(caret);
        }

        let offset = caret.getOffset();
        editor.insertText(offset, context.getContent())
        editor.getOpenedDocument().getUndoRedoStack().onTyped(caret, offset, context.getContent());
        if (context.shouldMoveCaret()) {
            caret.moveToOffset(offset + context.getContent().length);
            caret.refresh();
        }
        editor.getView().resetBlink();

        return BehaviorHandlingMode.HANDLED;
    }
}
