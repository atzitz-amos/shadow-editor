import {AbstractAction} from "../../../core/actions/AbstractAction";
import {Key, Keybind} from "../../../core/keybinds/Keybind";
import {KeybindContext} from "../../../core/keybinds/context/KeybindContext";
import {IndentUtils} from "../../../lang/syntax/utils/IndentUtils";
import {DocumentModificationUtils} from "../../../editor/core/document/utils/DocumentModificationUtils";
import {IndentedCodeModification} from "../../../editor/core/document/utils/IndentedCodeModification";

/**
 *
 * @author Atzitz Amos
 * @date 9/2/2026
 * @since 1.0.0
 */
export default class JsCommentOutCodeAction extends AbstractAction {
    getDefaultKeybinding(): Keybind | null {
        return {
            key: Key.NUMPAD_DIVIDE,
            ctrl: true,
            shift: false,
            alt: false
        };
    }

    getDescription(): string {
        return "Comment out a line of code";
    }

    getName(): string {
        return "Comment out line";
    }

    run(ctx: KeybindContext): void | Promise<void> {
        const editor = ctx.requireEditor();
        const document = editor.getOpenedDocument();
        const selectionModel = editor.getPrimaryCaret().getSelectionModel();

        let start = selectionModel.isSelectionActive ? selectionModel.getStart().row : editor.getPrimaryCaret().getLogical().row;
        let end = selectionModel.isSelectionActive ? selectionModel.getEnd().row : editor.getPrimaryCaret().getLogical().row;

        DocumentModificationUtils.modifyWithCaret(document, editor.getPrimaryCaret(), "commentOut", () => {
            const indentedCode = new IndentedCodeModification(document, start, end);

            const isUncomment = indentedCode.all(line => line.startsWith("//"));

            if (isUncomment) {
                indentedCode.deleteAtStartAndKeep(line => line.startsWith("// ") ? 3 : 2)
            } else {
                indentedCode.insertAtStartAndAlign((line, lineNo) => {
                    const indent = indentedCode.getIndent(lineNo);
                    const alignIndent = indentedCode.getAlignIndent();

                    return "// " + IndentUtils.makeIndentString(indent - alignIndent)
                });
            }
        }, false);
        editor.repaintView();
    }
}
