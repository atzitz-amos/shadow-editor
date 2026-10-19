import {AbstractAction} from "../../../core/actions/AbstractAction";
import {KeybindContext} from "../../../core/keybinds/context/KeybindContext";
import {Key, Keybind} from "../../../core/keybinds/Keybind";
import {LiveTemplate} from "../../../editor/core/live/LiveTemplate";
import {JsLexicalGrammar} from "../lang/lexer/JsLexicalGrammar";
import {TextRange} from "../../../editor/core/coordinate/range/TextRange";

/**
 *
 * @author Atzitz Amos
 * @date 9/28/2026
 * @since 1.0.0
 */
export default class JsLiveTemplateTest extends AbstractAction {
    run(ctx: KeybindContext): void | Promise<void> {
        ctx.getEvent().preventDefault();

        const editor = ctx.requireEditor();

        const tokenAt = editor.getOpenedDocument().getTokenAt(editor.getPrimaryCaret().getOffset());
        if (!tokenAt || tokenAt.getType() !== JsLexicalGrammar.IDENTIFIER) {
            ctx.abort();
            return;
        }

        const usages = editor.getOpenedDocument().getTextContent();

        const ranges: TextRange[] = [];
        let index = usages.indexOf(tokenAt!.getValue());
        while (index !== -1) {
            if (index !== tokenAt.getRange().start) ranges.push(new TextRange(index, index + tokenAt!.getValue().length));
            index = usages.indexOf(tokenAt!.getValue(), index + 1);
        }

        const template = new LiveTemplate(editor, tokenAt!.getRange(), ranges);
        template.start();
    }

    getName(): string {
        return "js-live-template-test";
    }

    getDescription(): string {
        return "Test action for JS live template";
    }

    getDefaultKeybinding(): Keybind | null {
        return {
            key: Key.F6,
            shift: true
        };
    }

}
