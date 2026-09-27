import {AbstractAction} from "../../../../../core/actions/AbstractAction";
import {KeybindContext} from "../../../../../core/keybinds/context/KeybindContext";
import {Key, Keybind} from "../../../../../core/keybinds/Keybind";
import {DataKey} from "../../../../../core/keybinds/context/data/DataKey";
import {CommonDataKeys} from "../../../../../core/keybinds/context/data/CommonDataKeys";
import {IntentsAnalysis} from "../../../../../lang/codeAnalysis/intents/analysis/IntentsAnalysis";
import {OffsetAttachedPopupFrame} from "../../builder/OffsetAttachedPopupFrame";
import {ContextActionPopupBuilder} from "../ContextActionPopupBuilder";
import {IntentBase} from "../../../../../lang/codeAnalysis/intents/IntentBase";

/**
 *
 * @author Atzitz Amos
 * @date 9/25/2026
 * @since 1.0.0
 */
export class OpenContextActionsPopupAction extends AbstractAction {
    async run(ctx: KeybindContext): Promise<void> {
        const editor = ctx.require(CommonDataKeys.EDITOR);

        const availableIntents = IntentsAnalysis.getApplicableIntentsAtCaret(editor)
        if (availableIntents.length) {
            const builder = new ContextActionPopupBuilder(availableIntents)
                .setOnActionChosen(async (selectedIntent) => {
                    popup.detach();
                    if (selectedIntent) await IntentsAnalysis.executeIntent(editor, selectedIntent)
                    editor.repaintView();
                });

            const popup = new OffsetAttachedPopupFrame(editor, builder)
                .captureFocus(true)
                .attachToOffset(editor.getPrimaryCaret().getOffset())
        }
    }

    getName(): string {
        return "Open Context Actions Popup";
    }

    getDescription(): string {
        return "Opens a popup with context actions for the current selection or cursor position.";
    }

    getDefaultKeybinding(): Keybind | null {
        return {
            key: Key.ENTER,
            ctrl: false,
            shift: false,
            alt: true,
        }
    }

    getRequiredKeys(): DataKey<unknown>[] {
        return [CommonDataKeys.EDITOR]
    }
}
