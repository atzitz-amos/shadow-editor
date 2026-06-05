import {TextEditAction} from "./TextEditAction";
import {Editor} from "../../../../Editor";
import {Caret} from "../../../caret/Caret";

/**
 *
 * @author Atzitz Amos
 * @date 6/5/2026
 * @since 1.0.0
 */
export class DeleteTextAction extends TextEditAction {
    public constructor(offset: Offset, private readonly deletedText: string, wasPrimaryCaret = false) {
        super(offset, -deletedText.length, wasPrimaryCaret);
    }

    getNewOffset() {
        return this.getOldOffset();
    }

    redo(editor: Editor, caret: Caret): void {
        editor.getOpenedDocument().deleteAt(this.getOldOffset(), -this.getAffectedDelta());
        caret.moveToOffset(this.getNewOffset());

        editor.repaintView();
    }

    undo(editor: Editor, caret: Caret): void {
        editor.getOpenedDocument().insertText(this.getOldOffset(), this.deletedText);
        caret.moveToOffset(this.getOldOffset() + this.deletedText.length);

        editor.repaintView();
    }
}
