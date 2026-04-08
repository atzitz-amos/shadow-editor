import {Key, Keybind} from "./Keybind";
import {AbstractAction} from "../actions/AbstractAction";
import {KeybindContext} from "./context/KeybindContext";

/**
 *
 * @author Atzitz Amos
 * @date 10/22/2025
 * @since 1.0.0
 */
export class KeybindManager {
    private static instance: KeybindManager;

    private actions = new Map<string, AbstractAction>();
    private keybinds = new Map<string, Keybind>();           // current custom binds
    private defaultKeybinds = new Map<string, Keybind>();     // defaults
    private enabled = new Map<string, boolean>();             // enable state

    public static getInstance(): KeybindManager {
        if (!KeybindManager.instance) {
            KeybindManager.instance = new KeybindManager();
        }
        return KeybindManager.instance;
    }

    registerAction(action: AbstractAction, defaultKeybind: Keybind | undefined): void {
        this.actions.set(action.id, action);
        if (defaultKeybind) {
            defaultKeybind.context = action.keybindContext;

            this.defaultKeybinds.set(action.id, defaultKeybind);
            this.enabled.set(action.id, true);
            if (!this.keybinds.has(action.id)) this.keybinds.set(action.id, defaultKeybind);
        } else {
            this.enabled.set(action.id, false);
        }
    }

    unregisterAction(action: AbstractAction) {
        this.actions.delete(action.id);
        this.enabled.delete(action.id);
        this.keybinds.delete(action.id);
        this.defaultKeybinds.delete(action.id);
    }

    enable(id: string): void {
        if (this.actions.has(id)) this.enabled.set(id, true);
    }

    disable(id: string): void {
        if (this.actions.has(id)) this.enabled.set(id, false);
    }

    setKeybind(id: string, newKeybind: Keybind): void {
        if (!this.actions.has(id)) {
            throw new Error(`Action with id '${id}' not registered`);
        }
        newKeybind.context = this.actions.get(id)!.keybindContext;
        this.keybinds.set(id, newKeybind);
    }

    resetKeybind(id: string): void {
        const def = this.defaultKeybinds.get(id);
        if (def) this.keybinds.set(id, def);
    }

    // --- EVENT HANDLING ---

    onKeydown(context: KeybindContext): void {
        const event = context.getEvent() as KeyboardEvent;

        for (const [id, action] of this.actions.entries()) {
            if (!this.enabled.get(id)) continue;

            const keybind = this.keybinds.get(id);
            if (!keybind || !context.applies(keybind.context!)) continue;

            if (this.matchesKeyboardEvent(event, keybind)) {
                event.preventDefault();
                action.run(context);
            }
        }
    }

    onMousedown(context: KeybindContext): void {
        const event = context.getEvent() as MouseEvent;
        const key = this.mouseEventToKey(event);
        if (!key) return;

        for (const [id, action] of this.actions.entries()) {
            if (!this.enabled.get(id)) continue;
            const keybind = this.keybinds.get(id);
            if (!keybind || !context.applies(keybind.context!)) continue;

            if (this.matchesMouseEvent(event, keybind, key)) {
                event.preventDefault();
                action.run(context);
            }
        }
    }

    private matchesKeyboardEvent(event: KeyboardEvent, bind: Keybind): boolean {
        // normalize to lowercase letters
        if (event.key.toLowerCase() !== bind.key.toLowerCase()) return false;

        if (bind.ctrl !== undefined && bind.ctrl !== null && bind.ctrl !== event.ctrlKey) return false;
        if (bind.shift !== undefined && bind.shift !== null && bind.shift !== event.shiftKey) return false;
        return !(bind.alt !== undefined && bind.alt !== null && bind.alt !== event.altKey);
    }

    private matchesMouseEvent(event: MouseEvent, bind: Keybind, keyFromEvent: Key): boolean {
        if (bind.key !== keyFromEvent) return false;

        if (bind.ctrl !== undefined && bind.ctrl !== null && bind.ctrl !== event.ctrlKey) return false;
        if (bind.shift !== undefined && bind.shift !== null && bind.shift !== event.shiftKey) return false;
        return !(bind.alt !== undefined && bind.alt !== null && bind.alt !== event.altKey);


    }

    private mouseEventToKey(event: MouseEvent): Key | null {
        switch (event.button) {
            case 0: // left button
                switch (event.detail) {
                    case 1:
                        return Key.LeftClick;
                    case 2:
                        return Key.LeftDoubleClick;
                    case 3:
                        return Key.LeftTripleClick;
                    default:
                        return Key.LeftClick;
                }
            case 1:
                return Key.MiddleClick;
            case 2: // right button
                switch (event.detail) {
                    case 1:
                        return Key.RightClick;
                    case 2:
                        return Key.RightDoubleClick;
                    default:
                        return Key.RightClick;
                }
            default:
                return null;
        }
    }
}

