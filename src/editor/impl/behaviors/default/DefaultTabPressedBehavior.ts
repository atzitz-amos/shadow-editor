import {TabPressedBehavior} from "../../../core/behaviors/behavior/TabPressedBehavior";
import {EditorBehaviorContext} from "../../../core/behaviors/context/EditorBehaviorContext";
import {BehaviorHandlingMode} from "../../../core/behaviors/manager/BehaviorHandlingMode";
import {IndentUtils} from "../../../../lang/syntax/utils/IndentUtils";
import {DocumentModificationUtils} from "../../../core/document/utils/DocumentModificationUtils";

/**
 *
 * @author Atzitz Amos
 * @date 10/22/2026
 * @since 1.0.0
 */
export class DefaultTabPressedBehavior extends TabPressedBehavior {
    invoke(context: EditorBehaviorContext): BehaviorHandlingMode {
        const editor = context.getEditor();
        const caret = editor.getPrimaryCaret();

        const indent = IndentUtils.makeIndentString(IndentUtils.getLanguageSpecificIndentationSize(editor.getCurrentLanguage()));

        DocumentModificationUtils.modifyWithCaret(editor.getOpenedDocument(), caret, "tab", () => {
            if (caret.getSelectionModel().isSelectionActive) {
                const start = caret.getSelectionModel().getStart().row;
                const end = caret.getSelectionModel().getEnd().row;

                for (let i = start; i <= end; i++) {
                    editor.insertText(editor.getOpenedDocument().getLineData(i).getStart(), indent);
                }
            } else {
                editor.insertText(caret.getOffset(), indent);
            }
        });

        editor.repaintView();
        return BehaviorHandlingMode.HANDLED;
    }

}
