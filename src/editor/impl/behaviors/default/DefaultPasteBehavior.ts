import {PasteBehavior} from "../../../core/behaviors/behavior/PasteBehavior";
import {ClipboardBehaviorContext} from "../../../core/behaviors/context/ClipboardBehaviorContext";
import {BehaviorHandlingMode} from "../../../core/behaviors/manager/BehaviorHandlingMode";
import {ClipboardUtils} from "../../../core/clipboard/ClipboardUtils";
import {UndoStack} from "../../../core/undo/UndoStack";

/**
 *
 * @author Atzitz Amos
 * @date 10/22/2026
 * @since 1.0.0
 */
export class DefaultPasteBehavior extends PasteBehavior {
    invoke(ctx: ClipboardBehaviorContext): BehaviorHandlingMode {
        const editor = ctx.getEditor();
        ClipboardUtils.getClipboardText().then(text => {
            if (text) {
                UndoStack.undoableAction(editor, "paste", () => {
                    editor.type(text);
                });
            }
        });

        return BehaviorHandlingMode.HANDLED;
    }
}
