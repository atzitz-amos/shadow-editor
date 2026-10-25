import {CopyBehavior} from "../../../core/behaviors/behavior/CopyBehavior";
import {ClipboardBehaviorContext} from "../../../core/behaviors/context/ClipboardBehaviorContext";
import {BehaviorHandlingMode} from "../../../core/behaviors/manager/BehaviorHandlingMode";
import {ClipboardUtils} from "../../../core/clipboard/ClipboardUtils";

/**
 *
 * @author Atzitz Amos
 * @date 10/22/2026
 * @since 1.0.0
 */
export class DefaultCopyBehavior extends CopyBehavior {
    invoke(context: ClipboardBehaviorContext): BehaviorHandlingMode {
        const editor = context.getEditor();
        const caret = editor.getPrimaryCaret();

        if (!caret.getSelectionModel().isSelectionActive) {
            let line = editor.getOpenedDocument().getLineAt(caret.getOffset());
            caret.getSelectionModel().select(line.getStart(), line.getEnd());
            caret.refresh();
        }
        ClipboardUtils.copyToClipboard(caret.getSelectedText()!);

        return BehaviorHandlingMode.HANDLED;
    }
}
