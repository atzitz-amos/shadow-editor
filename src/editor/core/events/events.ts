import {Editor} from "../../Editor";
import {PluginManager} from "../../plugins/Plugins";
import {Keybinding} from "./keybinding";

export type VisualEvent =
    "onAttached"
    | "onRender"
    | "onKeyDown"
    | "onKeyUp"
    | "onInput"
    | "onMouseDown"
    | "onMouseUp"
    | "onFocus"
    | "onBlur"
    | "onMouseMove"
    | "onScroll";


export type EditorEvent = "";

export type PluginEvent = "onRegistered";

export type GeneralEvent = VisualEvent | EditorEvent | PluginEvent;


export type ListenerType = ((editor: Editor, ...args: any[]) => void);

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

}

export interface PluginEventListener {
    onRegistered(pluginManager: PluginManager): void;
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
}

export abstract class AbstractPluginEventListener implements PluginEventListener {
    onRegistered(pluginManager: PluginManager): void {
    }
}


export class EventManager {
    private visualListeners: VisualEventListener[] = [];
    private editorListeners: EditorEventListener[] = [];
    private keybindingListeners: Map<Keybinding, ListenerType> = new Map();

    addVisualEventListener(listener: VisualEventListener) {
        this.visualListeners.push(listener);
    }

    addEditorEventListener(listener: EditorEventListener) {
        this.editorListeners.push(listener);
    }

    addKeybindingListener(keybinding: Keybinding, listener: ListenerType) {
        this.keybindingListeners.set(keybinding, listener);
    }

    fireKeybinding(event: KeyboardEvent, editor: Editor) {
        for (let [keybinding, listener] of this.keybindingListeners.entries()) {
            if (keybinding.matches(event)) {
                listener.apply(null, [editor, event]);
            }
        }
    }

    fire(event: GeneralEvent, editor: Editor, ...args: any[]) {
        if (this.visualListeners.length > 0 && (event as VisualEvent)) {
            for (const listener of this.visualListeners) {
                const method = listener[event as VisualEvent] as ListenerType;
                if (method) {
                    method.apply(listener, [editor, ...args]);
                }
            }
        } else if (this.editorListeners.length > 0 && (event as EditorEvent)) {
            for (const listener of this.editorListeners) {
                const method = listener[event as EditorEvent] as ListenerType;
                if (method) {
                    method.apply(listener, [editor, ...args]);
                }
            }
        }
    }
}