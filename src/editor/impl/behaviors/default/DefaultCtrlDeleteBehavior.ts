import {CtrlDeleteBehavior} from "../../../core/behaviors/behavior/CtrlDeleteBehavior";
import {EditorDeleteContext} from "../../../core/behaviors/context/EditorDeleteContext";
import {BehaviorHandlingMode} from "../../../core/behaviors/manager/BehaviorHandlingMode";
import {CtrlMoveHelper} from "../../actions/utils/CtrlMoveHelper";

/**
 *
 * @author Atzitz Amos
 * @date 6/25/2026
 * @since 1.0.0
 */
export class DefaultCtrlDeleteBehavior extends CtrlDeleteBehavior {
    invoke(context: EditorDeleteContext): BehaviorHandlingMode {
        const caret = context.getCaret();
        const editor = context.getEditor();

        if (context.hasSelectionActive()) editor.deleteSelection(caret);
        else {
            const offset = CtrlMoveHelper.getOffsetToPreviousWord(editor.getOpenedDocument(), caret.getOffset(), CtrlMoveHelper.DELIMITER);
            caret.moveToOffset(caret.getOffset() + offset);
            editor.deleteAt(caret.getOffset(), -offset);
        }

        return BehaviorHandlingMode.HANDLED;
    }

}
