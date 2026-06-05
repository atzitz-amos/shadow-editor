import {UndoableAction} from "../UndoableAction";
import {Editor} from "../../../../Editor";
import {TextEditAction} from "./TextEditAction";
import {Caret} from "../../../caret/Caret";

/**
 *
 * @author Atzitz Amos
 * @date 6/5/2026
 * @since 1.0.0
 */
export class BulkTextEditAction implements UndoableAction {
    public constructor(private readonly edits: TextEditAction[]) {
    }

    redo(editor: Editor): boolean {
        const carets = editor.getCaretModel().carets;
        const primary = editor.getCaretModel().getPrimary();
        const editToCaret = new Map<TextEditAction, Caret | undefined>();

        let caretMoved = false;

        for (const edit of this.edits) {
            if (edit.wasPrimaryCaret()) {
                if (primary.getOffset() != edit.getOldOffset()) {
                    primary.moveToOffset(edit.getOldOffset());
                    caretMoved = true;
                }
            } else {
                let caret = carets.find(c => c.getOffset() === edit.getOldOffset());
                if (!caret) {
                    caretMoved = true;
                }
                editToCaret.set(edit, caret);
            }
        }

        if (caretMoved) {
            editor.getCaretModel().removeAll();
            editor.getPrimaryCaret().getSelectionModel().clear();
            for (const edit of this.edits) {
                if (!edit.wasPrimaryCaret()) {
                    editor.getCaretModel().addCaret(editor.offsetToLogical(edit.getOldOffset()));
                }
            }

            return false;
        }

        let selectionChanged = false;
        for (const caret of carets) {
            if (caret.getSelectionModel().isSelectionActive) {
                caret.getSelectionModel().clear();
                selectionChanged = true;
            }
        }
        if (selectionChanged) {
            return false;
        }

        const orderedEdits = this.edits.sort((a, b) => a.getOldOffset() - b.getOldOffset());

        for (const edit of orderedEdits) {
            edit.redo(editor, editToCaret.get(edit) ?? primary);
        }

        return true;
    }

    undo(editor: Editor): boolean {
        const carets = editor.getCaretModel().carets;
        const primary = editor.getCaretModel().getPrimary();
        const editToCaret = new Map<TextEditAction, Caret | undefined>();

        let caretMoved = false;

        for (const edit of this.edits) {
            if (edit.wasPrimaryCaret()) {
                if (primary.getOffset() != edit.getNewOffset()) {
                    primary.moveToOffset(edit.getNewOffset());
                    caretMoved = true;
                }
            } else {
                let caret = carets.find(c => c.getOffset() === edit.getNewOffset());
                if (!caret) {
                    caretMoved = true;
                }
                editToCaret.set(edit, caret);
            }
        }

        if (caretMoved) {
            editor.getCaretModel().removeAll();
            editor.getPrimaryCaret().getSelectionModel().clear();
            for (const edit of this.edits) {
                if (!edit.wasPrimaryCaret()) {
                    editor.getCaretModel().addCaret(editor.offsetToLogical(edit.getNewOffset()));
                }
            }

            return false;
        }

        let selectionChanged = false;
        for (const caret of carets) {
            if (caret.getSelectionModel().isSelectionActive) {
                caret.getSelectionModel().clear();
                selectionChanged = true;
            }
        }
        if (selectionChanged) {
            return false;
        }

        const orderedEdits = this.edits.sort((a, b) => b.getNewOffset() - a.getNewOffset());

        for (const edit of orderedEdits) {
            edit.undo(editor, editToCaret.get(edit) ?? primary);
        }

        return true;
    }

}
