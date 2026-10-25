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
        const wasUndoing = this.undoing;
        this.undoing = true;
        try {
            func();
        } finally {
            this.undoing = wasUndoing;
        }
    }

    static undoableAction<T>(editor: Editor, name: string, func: () => T, transparent: boolean = false): T {
        const stack = editor.getOpenedDocument().getUndoRedoStack();
        const wasApplied = stack.startUndoableAction(editor, name, transparent);
        try {
            return func();
        } finally {
            // Always close the frame, otherwise a throwing action would leave it open and block every later frame
            if (wasApplied) stack.finishUndoableAction(editor);
        }
    }

    static discardFrame(editor: Editor) {
        editor.getOpenedDocument().getUndoRedoStack().discardFrame();
    }
}
