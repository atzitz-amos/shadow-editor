import {AbstractAction} from "../../../core/actions/AbstractAction";
import {KeybindContext} from "../../../core/keybinds/context/KeybindContext";
import {Key, Keybind} from "../../../core/keybinds/Keybind";
import {SpacingFormatter} from "../../../lang/codeStyle/spacing/SpacingFormatter";
import {JsSpacingRules} from "../codeStyle/JsSpacingRules";
import {JsLexicalGrammar} from "../lang/lexer/JsLexicalGrammar";
import {SynDocumentManager} from "../../../lang/syntax/manager/SynDocumentManager";
import {UndoStack} from "../../../editor/core/undo/UndoStack";

/**
 *
 * @author Atzitz Amos
 * @date 8/16/2026
 * @since 1.0.0
 */
export default class ReformatCodeAction extends AbstractAction {
    private readonly formatter = SpacingFormatter.make(JsSpacingRules, [JsLexicalGrammar.WHITESPACE], [JsLexicalGrammar.EOL]);

    run(ctx: KeybindContext): void | Promise<void> {
        if (!ctx.isEditorEvent()) {
            // TODO
        } else {
            const editor = ctx.requireEditor();
            const stream = editor.getOpenedDocument().getTokenCache().createTokenStream();
            const synDocument = editor.getLangService().getSynFile().getSynDocument();
            console.log(synDocument)

            const text = this.formatter.format(stream, synDocument.getTree());
            console.log(text);

            UndoStack.undoableAction(editor, "reformatCode", () => {
                editor.replaceRange(editor.getFullRange(), text);
            });
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
