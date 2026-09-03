import {AbstractAction} from "../../../core/actions/AbstractAction";
import {KeybindContext} from "../../../core/keybinds/context/KeybindContext";
import {Key, Keybind} from "../../../core/keybinds/Keybind";
import {SelectedLineOffsetUtils} from "./utils/SelectedLineOffsetUtils";
import {DocumentModificationUtils} from "../../core/document/utils/DocumentModificationUtils";

/**
 *
 * @author Atzitz Amos
 * @date 9/3/2026
 * @since 1.0.0
 */
export class DeleteLineAction extends AbstractAction {
    run(ctx: KeybindContext): void | Promise<void> {
        const editor = ctx.requireEditor();

        const start = SelectedLineOffsetUtils.getStart(editor.getPrimaryCaret())
        const end = SelectedLineOffsetUtils.getEnd(editor.getPrimaryCaret())

        DocumentModificationUtils.modifyWithCaret(editor.getOpenedDocument(), editor.getPrimaryCaret(), "deleteLine", () => {
            editor.getPrimaryCaret().getSelectionModel().clear();

            let length = 0;
            for (let lineNo = start; lineNo <= end; lineNo++) {
                length += editor.getOpenedDocument().getLineData(lineNo).getLineLength() + 1;
            }

            const offset = editor.getOpenedDocument().getLineData(start).getStart() - 1;
            editor.getOpenedDocument().deleteAt(offset, length);
        }, false);

        editor.repaintView();
    }

    getName(): string {
        return "Delete Line";
    }

    getDescription(): string {
        return "Delete current line"
    }

    getDefaultKeybinding(): Keybind | null {
        return {
            key: Key.Y,
            ctrl: true,
            alt: false,
            shift: false
        }
    }

}
