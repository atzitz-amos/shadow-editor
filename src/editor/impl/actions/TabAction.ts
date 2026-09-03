import {AbstractAction} from "../../../core/actions/AbstractAction";
import {Key, Keybind} from "../../../core/keybinds/Keybind";
import {KeybindContext} from "../../../core/keybinds/context/KeybindContext";
import {DocumentModificationUtils} from "../../core/document/utils/DocumentModificationUtils";


export class TabAction extends AbstractAction {
    getName(): string {
        return 'Tab';
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
        const caret = editor.getPrimaryCaret();

        DocumentModificationUtils.modifyWithCaret(editor.getOpenedDocument(), caret, "tab", () => {
            if (caret.getSelectionModel().isSelectionActive) {
                const start = caret.getSelectionModel().getStart().row;
                const end = caret.getSelectionModel().getEnd().row;

                for (let i = start; i <= end; i++) {
                    editor.insertText(editor.getOpenedDocument().getLineData(i).getStart(), '    ');
                }
            } else {
                editor.insertText(caret.getOffset(), '    ');
            }
        });

        editor.repaintView();
    }
}

export class ShiftTabAction extends AbstractAction {
    run(ctx: KeybindContext): void | Promise<void> {
        ctx.getEvent().preventDefault();

        const editor = ctx.requireEditor();
        const document = editor.getOpenedDocument();
        const selectionModel = editor.getPrimaryCaret().getSelectionModel();

        const start = selectionModel.isSelectionActive ? selectionModel.getStart().row : editor.getPrimaryCaret().getLogical().row;
        const end = selectionModel.isSelectionActive ? selectionModel.getEnd().row : editor.getPrimaryCaret().getLogical().row;

        DocumentModificationUtils.modifyWithCaret(document, editor.getPrimaryCaret(), "dedent", () => {
            for (let i = start; i <= end; i++) {
                const line = document.getLineData(i);
                const indent = line.getIndentationSize();
                const dedentSize = Math.min(indent, 4);
                document.deleteAt(line.getStart(), dedentSize);
            }
        }, false);

        editor.repaintView();
    }

    getName(): string {
        return "Dedent"
    }

    getDescription(): string {
        return "Dedent code fragment"
    }

    getDefaultKeybinding(): Keybind | null {
        return {
            key: Key.TAB,
            shift: true,
            ctrl: false,
            alt: false
        }
    }

}