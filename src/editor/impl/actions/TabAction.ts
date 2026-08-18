import {AbstractAction} from "../../../core/actions/AbstractAction";
import {Key} from "../../../core/keybinds/Keybind";
import {KeybindContext} from "../../../core/keybinds/context/KeybindContext";
import {UndoStack} from "../../core/undo/UndoStack";


export class TabAction extends AbstractAction {
    getName(): string {
        return 'TabAction';
    }

    getDescription(): string {
        return 'Insert a tab character at the caret position.';
    }

    getDefaultKeybinding() {
        return {
            key: Key.TAB,
            ctrl: false,
            alt: false,
            shift: false
        };
    }

    run(ctx: KeybindContext) {
        const editor = ctx.requireEditor();

        ctx.getEvent().preventDefault();
        UndoStack.undoableAction(editor, "tab", () => {
            editor.getCaretModel().forEachCaret(caret => {
                if (caret.getSelectionModel().isSelectionActive) {
                    const start = editor.getOpenedDocument().getLineAt(caret.getSelectionModel().getActualStart()).getLineNumber();
                    const end = editor.getOpenedDocument().getLineAt(caret.getSelectionModel().getActualEnd()).getLineNumber();

                    for (let i = start; i <= end; i++) {
                        editor.insertText(editor.getOpenedDocument().getLineData(i).getStart(), '    ');
                    }
                } else {
                    editor.insertText(caret.getOffset(), '    ');
                }

            });
            editor.getCaretModel().shift(4);
        });

        editor.getView().resetBlink();
    }
}