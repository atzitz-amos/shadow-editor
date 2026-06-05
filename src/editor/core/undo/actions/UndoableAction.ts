import {Editor} from "../../../Editor";

/**
 *
 * @author Atzitz Amos
 * @date 6/5/2026
 * @since 1.0.0
 */
export interface UndoableAction {

    /**
     * Undo the action in the given editor. Returns true if the undo was fully performed (ie. the action should pop from the undo stack),
     * false if the undo was only partially performed (ie. only the caret moved for instance)
     */
    undo(editor: Editor): boolean;

    redo(editor: Editor): boolean;
}
