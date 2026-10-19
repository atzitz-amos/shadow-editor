import {AbstractAction} from "../../../../core/actions/AbstractAction";
import {KeybindContext} from "../../../../core/keybinds/context/KeybindContext";
import {Key, Keybind} from "../../../../core/keybinds/Keybind";
import {IdeDialogUtilsCore} from "../../../../core/ui/lib/dialog/utils/IdeDialogUtilsCore";
import {IdeFindDialog} from "../../../ui/full/search/IdeFindDialog";
import {DataKey} from "../../../../core/keybinds/context/data/DataKey";

/**
 *
 * @author Atzitz Amos
 * @date 10/17/2026
 * @since 1.0.0
 */
export class SearchEverywhereAction extends AbstractAction {
    async run(ctx: KeybindContext): Promise<void> {
        IdeDialogUtilsCore.showDialog(new IdeFindDialog());
    }

    getName(): string {
        return "Search Everywhere";
    }

    getDescription(): string {
        return "Search for anything in the IDE";
    }

    getDefaultKeybinding(): Keybind | null {
        return {
            key: Key.F,
            ctrl: true,
            shift: true,
            alt: false
        }
    }

    getRequiredKeys(): DataKey<unknown>[] {
        return [];
    }
}
