import {Editor} from "../Editor";
import {Caret} from "../core/caret/Caret";

/**
 *
 * @author Atzitz Amos
 * @date 7/6/2026
 * @since 1.0.0
 */
export class EditorTypingUtils {
    public static deleteWithCaret(editor: Editor, caret: Caret, at: Offset, n: number) {
        const offset = caret.getOffset();
        editor.deleteAt(at, n);
        console.log(offset, at)
        if (offset >= at) {
            caret.moveToOffset(offset - n, false);
            caret.refresh();
        }
    }
}
