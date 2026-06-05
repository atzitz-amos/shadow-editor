/**
 *
 * @author Atzitz Amos
 * @date 6/5/2026
 * @since 1.0.0
 */
import {Editor} from "../../../../Editor";
import {TextEditAction} from "./TextEditAction";
import {Caret} from "../../../caret/Caret";

export class InsertTextAction extends TextEditAction {
    public constructor(offset: number, private readonly text: string, wasPrimaryCaret: boolean = false) {
        super(offset, text.length, wasPrimaryCaret);
    }

    getNewOffset() {
        return this.getOldOffset() + this.text.length;
    }

    redo(editor: Editor, caret: Caret): void {
        editor.getOpenedDocument().insertText(this.getOldOffset(), this.text);
        caret.moveToOffset(this.getNewOffset());

        editor.repaintView();
    }

    undo(editor: Editor, caret: Caret): void {
        editor.getOpenedDocument().deleteAt(this.getOldOffset(), this.getAffectedDelta());
        caret.moveToOffset(this.getOldOffset());

        editor.repaintView();
    }
}
