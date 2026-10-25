import {CutBehavior} from "../../../core/behaviors/behavior/CutBehavior";
import {ClipboardBehaviorContext} from "../../../core/behaviors/context/ClipboardBehaviorContext";
import {BehaviorHandlingMode} from "../../../core/behaviors/manager/BehaviorHandlingMode";
import {UndoStack} from "../../../core/undo/UndoStack";
import {ClipboardUtils} from "../../../core/clipboard/ClipboardUtils";

/**
 *
 * @author Atzitz Amos
 * @date 10/22/2026
 * @since 1.0.0
 */
export class DefaultCutBehavior extends CutBehavior {
    invoke(ctx: ClipboardBehaviorContext): BehaviorHandlingMode {
        const editor = ctx.getEditor();
        const caret = editor.getPrimaryCaret();

        UndoStack.undoableAction(editor, "cut", () => {
            if (!caret.getSelectionModel().isSelectionActive) {
                let line = editor.getOpenedDocument().getLineAt(caret.getOffset());
                const text = editor.getOpenedDocument().substring(line.getStart(), line.getEnd());
                editor.deleteWholeLine(caret);
                ClipboardUtils.copyToClipboard(text);
                return;
            }
            ClipboardUtils.copyToClipboard(caret.getSelectedText()!);
            editor.deleteSelection(caret);
        });

        return BehaviorHandlingMode.HANDLED;
    }
}
