import {AbstractAction} from "../../../core/actions/AbstractAction";
import {KeybindContext} from "../../../core/keybinds/context/KeybindContext";
import {Key, Keybind} from "../../../core/keybinds/Keybind";
import {SynDocumentManager} from "../../../lang/syntax/manager/SynDocumentManager";
import {JsCodeStyleManager} from "../codeStyle/JsCodeStyleManager";
import {QuickParseUtils} from "../../../lang/syntax/utils/QuickParseUtils";
import {DocumentModificationUtils} from "../../../editor/core/document/utils/DocumentModificationUtils";

/**
 *
 * @author Atzitz Amos
 * @date 8/16/2026
 * @since 1.0.0
 */
export default class ReformatCodeAction extends AbstractAction {
    run(ctx: KeybindContext): void | Promise<void> {
        if (!ctx.isEditorEvent()) {
            // TODO
        } else {
            const editor = ctx.requireEditor();
            const stream = editor.getOpenedDocument().getTokenCache().createTokenStream();
            const synDocument = SynDocumentManager.getOpenedSynDocument(editor);

            const visitor = JsCodeStyleManager.getInstance().getFormattingBlockVisitor();
            const engine = JsCodeStyleManager.getInstance().getFormattingEngine();
            const result1 = engine.format(visitor.format(synDocument.getTree(), stream))
            const quickParse = QuickParseUtils.quickParse(synDocument.getLanguage(), result1)
            const result2 = JsCodeStyleManager.getInstance().getSpacingFormatter().format(quickParse.tokenStream, quickParse.tree);

            console.log(result1);

            const document = synDocument.getDocument();
            DocumentModificationUtils.modifyWithCaret(document, editor.getPrimaryCaret(), "reformat", () => {
                document.replaceRange(document.getFullRange(), result2);
            });

            editor.repaintView();
        }
    }

    getName(): string {
        return "Reformat Code";
    }

    getDescription(): string {
        return "Reformats the code in the current file according to the code style settings.";
    }

    getDefaultKeybinding(): Keybind | null {
        return {
            key: Key.L,
            ctrl: true,
            alt: true,
            shift: false
        }
    }
}
