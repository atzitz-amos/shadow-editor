import {AbstractAction} from "./AbstractAction";
import {KeybindEventLike, PhantomKeybindEvent} from "../keybinds/context/KeybindEventLike";
import {PaneManager} from "../../app/core/panes/PaneManager";
import {PaneDockPosition} from "../../app/core/panes/pane/PaneDockPosition";
import {GlobalState} from "../global/GlobalState";
import {KeybindContextDescriptor} from "../keybinds/context/KeybindContextDescriptor";
import {KeybindContext} from "../keybinds/context/KeybindContext";

/**
 *
 * @author Atzitz Amos
 * @date 7/3/2026
 * @since 1.0.0
 */
export class ActionRunnerUtils {
    public static buildCtxForAction(action: AbstractAction, event?: KeybindEventLike) {
        if (!event) event = new PhantomKeybindEvent();

        let pane = PaneManager.getInstance().getActivePane(PaneDockPosition.LEFT);
        let editor = GlobalState.getMainEditor();

        let ctxDescriptor = 0;
        if (pane) ctxDescriptor |= KeybindContextDescriptor.IN_PANE;
        if (editor) ctxDescriptor |= KeybindContextDescriptor.IN_MAIN_EDITOR;

        const ctx = new KeybindContext(ctxDescriptor, event, editor, pane);
        if (!ctx.applies(action.getKeybindContext())) return null;

        return ctx;
    }

    public static tryRun(action: AbstractAction, event?: KeybindEventLike): boolean {
        let ctx = ActionRunnerUtils.buildCtxForAction(action, event);
        if (!ctx) return false;

        action.run(ctx);
        return true;
    }

    public static canRun(action: AbstractAction): boolean {
        return ActionRunnerUtils.buildCtxForAction(action) !== null;
    }

    public static runWithCallback(action: AbstractAction, event: KeybindEventLike | null, callback: () => void, errorCallback?: (msg: string) => void) {
        ActionRunnerUtils.awaitCompletion(action, event ?? undefined)
            .then(callback)
            .catch(errorCallback);
    }

    public static awaitCompletion(action: AbstractAction, event?: KeybindEventLike): Promise<void> {
        const ctx = ActionRunnerUtils.buildCtxForAction(action, event)
        if (!ctx) return Promise.reject("Cannot run action, no available context");
        const promise = action.run(ctx);

        if (promise instanceof Promise) return promise;
        return Promise.resolve();
    }
}
