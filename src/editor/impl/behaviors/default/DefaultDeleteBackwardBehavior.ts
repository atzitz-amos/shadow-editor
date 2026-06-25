import {DeleteBackwardBehavior} from "../../../core/behaviors/behavior/DeleteBackwardBehavior";
import {EditorDeleteContext} from "../../../core/behaviors/context/EditorDeleteContext";
import {BehaviorHandlingMode} from "../../../core/behaviors/manager/BehaviorHandlingMode";

/**
 *
 * @author Atzitz Amos
 * @date 6/25/2026
 * @since 1.0.0
 invoke(context: EditorDeletedContext): BehaviorHandlingMode {
 throw new Error("Method not implemented.");
 }
 */
export class DefaultDeleteBackwardBehavior extends DeleteBackwardBehavior {
    invoke(context: EditorDeleteContext): BehaviorHandlingMode {
        const editor = context.getEditor();
        const caret = context.getCaret();

        if (caret.getSelectionModel().isSelectionActive) editor.deleteSelection(caret);
        else {
            if (caret.getOffset() === 0) return BehaviorHandlingMode.HANDLED;
            caret.shiftLeft();
            if (!caret.isBeforeInlay())
                editor.deleteAt(caret.getOffset());
        }

        return BehaviorHandlingMode.HANDLED;
    }

}
