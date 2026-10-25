import {ShiftTabPressedBehavior} from "../../../core/behaviors/behavior/ShiftTabPressedBehavior";
import {EditorBehaviorContext} from "../../../core/behaviors/context/EditorBehaviorContext";
import {BehaviorHandlingMode} from "../../../core/behaviors/manager/BehaviorHandlingMode";
import {DocumentModificationUtils} from "../../../core/document/utils/DocumentModificationUtils";
import {IndentUtils} from "../../../../lang/syntax/utils/IndentUtils";

/**
 *
 * @author Atzitz Amos
 * @date 10/22/2026
 * @since 1.0.0
 */
export class DefaultShiftTabPressedBehavior extends ShiftTabPressedBehavior {
    invoke(context: EditorBehaviorContext): BehaviorHandlingMode {
        const editor = context.getEditor();
        const document = editor.getOpenedDocument();
        const selectionModel = editor.getPrimaryCaret().getSelectionModel();

        const start = selectionModel.isSelectionActive ? selectionModel.getStart().row : editor.getPrimaryCaret().getLogical().row;
        const end = selectionModel.isSelectionActive ? selectionModel.getEnd().row : editor.getPrimaryCaret().getLogical().row;

        DocumentModificationUtils.modifyWithCaret(document, editor.getPrimaryCaret(), "dedent", () => {
            for (let i = start; i <= end; i++) {
                const line = document.getLineData(i);
                const indent = line.getIndentationSize();
                const dedentSize = Math.min(indent, IndentUtils.getLanguageSpecificIndentationSize(editor.getCurrentLanguage()));
                document.deleteAt(line.getStart(), dedentSize);
            }
        }, false);

        editor.repaintView();
        return BehaviorHandlingMode.HANDLED;
    }

}
