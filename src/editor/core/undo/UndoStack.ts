import {Editor} from "../../Editor";

/**
 *
 * @author Atzitz Amos
 * @date 8/17/2026
 * @since 1.0.0
 */
export class UndoStack {
    public static undoing: boolean = false;


    static whileUndoing(func: () => void) {
        this.undoing = true;
        func();
        this.undoing = false;
    }

    static undoableAction<T>(editor: Editor, name: string, func: () => T, transparent: boolean = false): T {
        const wasApplied = editor.getOpenedDocument().getUndoRedoStack().startUndoableAction(editor, name, transparent);
        const result = func();
        if (wasApplied) editor.getOpenedDocument().getUndoRedoStack().finishUndoableAction(editor);
        return result;
    }

    static discardFrame(editor: Editor) {
        editor.getOpenedDocument().getUndoRedoStack().discardFrame();
    }
}
