import {DeleteForwardBehavior} from "../../../core/behaviors/behavior/DeleteForwardBehavior";
import {EditorDeleteContext} from "../../../core/behaviors/context/EditorDeleteContext";
import {BehaviorHandlingMode} from "../../../core/behaviors/manager/BehaviorHandlingMode";

/**
 *
 * @author Atzitz Amos
 * @date 6/25/2026
 * @since 1.0.0
 */
export class DefaultDeleteForwardBehavior extends DeleteForwardBehavior {
    invoke(context: EditorDeleteContext): BehaviorHandlingMode {
        const editor = context.getEditor();
        const caret = context.getCaret();

        if (context.hasSelectionActive()) editor.deleteSelection(caret);
        else if (!caret.isBeforeInlay()) editor.deleteAt(caret.getOffset());
        else caret.shiftRight();

        return BehaviorHandlingMode.HANDLED;
    }

}
