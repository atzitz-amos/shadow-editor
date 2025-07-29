import {Editor} from "../../Editor";
import {PluginManager} from "../../plugins/Plugins";
import {Keybind} from "./keybind";
import {Caret} from "../Caret";
import {Position} from "../Position";

export interface VisualEventListener {
    onAttached(editor: Editor, root: HTMLElement): void;

    onRender(editor: Editor): void;

    onInput(editor: Editor, event: InputEvent): void;

    onKeyDown(editor: Editor, event: KeyboardEvent): void;

    onKeyUp(editor: Editor, event: KeyboardEvent): void;

    onMouseDown(editor: Editor, event: MouseEvent): void;

    onMouseUp(editor: Editor, event: MouseEvent): void;

    onMouseMove(editor: Editor, event: MouseEvent): void;

    onScroll(editor: Editor, event: WheelEvent): void;

    onFocus(editor: Editor, event: FocusEvent): void;

    onBlur(editor: Editor, event: FocusEvent): void;
}

export interface EditorEventListener {
    onCaretMove(editor: Editor, caret: Caret, oldPos: Position, newPos: Position): void;

    onCaretRemove(editor: Editor, caret: Caret): void;
}

export interface PluginEventListener {
    onRegistered(editor: Editor, pluginManager: PluginManager): void;
}

export abstract class AbstractVisualEventListener implements VisualEventListener {
    onAttached(editor: Editor, root: HTMLElement): void {
    }

    onBlur(editor: Editor, event: FocusEvent): void {
    }

    onFocus(editor: Editor, event: FocusEvent): void {
    }

    onInput(editor: Editor, event: InputEvent): void {
    }

    onKeyDown(editor: Editor, event: KeyboardEvent): void {
    }

    onKeyUp(editor: Editor, event: KeyboardEvent): void {
    }

    onMouseDown(editor: Editor, event: MouseEvent): void {
    }

    onMouseMove(editor: Editor, event: MouseEvent): void {
    }

    onMouseUp(editor: Editor, event: MouseEvent): void {
    }

    onRender(editor: Editor): void {
    }

    onScroll(editor: Editor, event: WheelEvent): void {
    }
}

export abstract class AbstractEditorEventListener implements EditorEventListener {
    onCaretRemove(editor: Editor, caret: Caret): void {
    }

    onCaretMove(editor: Editor, caret: Caret, oldPos: Position, newPos: Position): void {
    }
}

export abstract class AbstractPluginEventListener implements PluginEventListener {
    onRegistered(editor: Editor, pluginManager: PluginManager): void {
    }
}

export interface GeneralEventListener extends VisualEventListener, EditorEventListener, PluginEventListener {
}


export type VisualEvent = keyof VisualEventListener;

export type EditorEvent = keyof EditorEventListener;

export type PluginEvent = keyof PluginEventListener;

export type GeneralEvent = keyof GeneralEventListener;

export type ListenerType = (...args: any[]) => void;

type Tail<T extends any[]> = T extends [any, ...infer R] ? R : never;
export type EventArgs<T extends GeneralEvent> = Tail<Parameters<GeneralEventListener[T]>>;

export class EventManager {
    private visualListeners: VisualEventListener[] = [];
    private editorListeners: EditorEventListener[] = [];
    private keybindingListeners: Map<Keybind, ListenerType> = new Map();

    addVisualEventListener(listener: VisualEventListener) {
        this.visualListeners.push(listener);
    }

    addEditorEventListener(listener: EditorEventListener) {
        this.editorListeners.push(listener);
    }

    addKeybindingListener(keybinding: Keybind, listener: ListenerType) {
        this.keybindingListeners.set(keybinding, listener);
    }

    fireKeybinding(event: KeyboardEvent, editor: Editor) {
        for (let [keybind, listener] of this.keybindingListeners.entries()) {
            if (this.matches(keybind, event)) {
                listener.apply(null, [editor, event]);
            }
        }
    }

    fire(event: GeneralEvent, ...args: any[]): void {
        for (const listener of this.visualListeners) {
            const method = listener[event as VisualEvent] as ListenerType;
            if (method) {
                method.apply(listener, args);
            }
        }
        for (const listener of this.editorListeners) {
            const method = listener[event as EditorEvent] as ListenerType;
            if (method) {
                method.apply(listener, args);
            }
        }
    }

    private matches(keybind: Keybind, event: KeyboardEvent) {
        return event.key === keybind.key
            && (keybind.ctrl ? event.ctrlKey : true)
            && (keybind.alt ? event.altKey : true)
            && (keybind.shift ? event.shiftKey : true);
    }
}