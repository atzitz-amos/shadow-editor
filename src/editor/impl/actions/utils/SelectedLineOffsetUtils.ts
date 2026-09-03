import {Caret} from "../../../core/caret/Caret";

/**
 *
 * @author Atzitz Amos
 * @date 9/3/2026
 * @since 1.0.0
 */
export class SelectedLineOffsetUtils {
    public static getStart(caret: Caret) {
        if (caret.getSelectionModel().isSelectionActive) {
            return caret.getSelectionModel().getStart().row;
        }
        return caret.getLogical().row;
    }

    public static getEnd(caret: Caret) {
        if (caret.getSelectionModel().isSelectionActive) {
            return caret.getSelectionModel().getEnd().row;
        }
        return caret.getLogical().row;
    }
}
