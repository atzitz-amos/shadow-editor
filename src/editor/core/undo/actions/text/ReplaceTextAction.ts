import {Editor} from "../../../../Editor";
import {Caret} from "../../../caret/Caret";
import {TextEditAction} from "./TextEditAction";
import {TextRange} from "../../../coordinate/range/TextRange";

/**
 *
 * @author Atzitz Amos
 * @date 6/7/2026
 * @since 1.0.0
 */
export class ReplaceTextAction extends TextEditAction {
    constructor(private readonly caretOld: Offset, private readonly caretNew: Offset, private readonly range: TextRange, private readonly oldText: string, private readonly newText: string) {
        super(caretOld, 0, true);
    }

    getNewOffset(): Offset {
        return this.caretNew;
    }

    redo(editor: Editor, caret: Caret): void {
        editor.getOpenedDocument().deleteAt(this.range.start, this.oldText.length);
        editor.getOpenedDocument().insertText(this.range.start, this.newText);
        caret.moveToOffset(this.caretNew);

        editor.repaintView();
    }

    undo(editor: Editor, caret: Caret): void {
        editor.getOpenedDocument().deleteAt(this.range.start, this.newText.length);
        editor.getOpenedDocument().insertText(this.range.start, this.oldText);
        caret.moveToOffset(this.caretOld);

        editor.repaintView();
    }

}
