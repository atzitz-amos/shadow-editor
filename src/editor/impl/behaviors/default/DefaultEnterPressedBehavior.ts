import {EditorDeleteContext} from "../../../core/behaviors/context/EditorDeleteContext";
import {BehaviorHandlingMode} from "../../../core/behaviors/manager/BehaviorHandlingMode";
import {EnterPressedBehavior} from "../../../core/behaviors/behavior/EnterPressedBehavior";
import {ModifierKeyHolder} from "../../../../core/keybinds/Keybind";

/**
 *
 * @author Atzitz Amos
 * @date 6/25/2026
 * @since 1.0.0
 */
export class DefaultEnterPressedBehavior extends EnterPressedBehavior {
    invoke(context: EditorDeleteContext): BehaviorHandlingMode {
        const caret = context.getCaret();
        const editor = context.getEditor();

        const line = editor.getOpenedDocument().getLineAt(caret.getOffset());

        if (ModifierKeyHolder.isShiftPressed()) {
            editor.insertText(line.getEnd(), "\n");
            caret.moveToOffset(line.getEnd() + 1);
            return BehaviorHandlingMode.HANDLED;
        }

        let indent = 0;
        if (line) {
            indent = line.getText().match(/^\s*/)?.[0].length || 0;
            indent = Math.min(indent, caret.getLogical().col);
        }

        editor.typeForCaret(caret, "\n" + " ".repeat(indent), !ModifierKeyHolder.isCtrlPressed());

        return BehaviorHandlingMode.HANDLED;
    }
}
