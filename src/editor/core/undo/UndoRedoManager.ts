import {Editor} from "../../Editor";

/**
 *
 * @author Atzitz Amos
 * @date 6/5/2026
 * @since 1.0.0
 */

export class UndoRedoManager {
    public constructor(private readonly editor: Editor) {
    }

    public undo() {
        const stack = this.editor.getOpenedDocument().getUndoRedoStack();
        stack.commitPartialEdits();
        if (stack.canUndo()) {
            const action = stack.getCurrent();
            if (action && action.undo(this.editor)) {
                stack.undo();
            }
        }
    }

    public redo() {
        const stack = this.editor.getOpenedDocument().getUndoRedoStack();
        stack.commitPartialEdits();
        if (stack.canRedo()) {
            const action = stack.getNext();
            if (action && action.redo(this.editor)) {
                stack.redo();
            }
        }
    }

    commitPartialEdits() {
        const stack = this.editor.getOpenedDocument().getUndoRedoStack();
        stack.commitPartialEdits();
    }
}
