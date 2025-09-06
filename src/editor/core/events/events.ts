import {Editor} from "../../Editor";
import {PluginManager} from "../../plugins/Plugins";
import {Key, Keybind} from "./keybind";
import {Caret} from "../Caret";
import {TextContext} from "../coordinate/TextRange";
import {SRNode} from "../lang/parser/ast";
import {TokenStream} from "../lang/lexer/TokenStream";
import {LogicalPosition} from "../coordinate/LogicalPosition";

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
    onCaretMove(editor: Editor, caret: Caret, oldPos: LogicalPosition, newPos: LogicalPosition): void;

    onCaretRemove(editor: Editor, caret: Caret): void;

    onSrLoaded(editor: Editor, ctx: TextContext, nodes: SRNode[], tokens: TokenStream<any>): void;
}

export interface PluginEventListener {
    onRegistered(editor: Editor, pluginManager: PluginManager): void;
}

export interface LangEventListener {
    onSrLoaded(editor: Editor, ctx: TextContext, nodes: SRNode[], tokens: TokenStream<any>): void;
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
    onSrLoaded(editor: Editor, ctx: TextContext, nodes: SRNode[], tokens: TokenStream<any>): void {
    }

    onCaretRemove(editor: Editor, caret: Caret): void {
    }

    onCaretMove(editor: Editor, caret: Caret, oldPos: LogicalPosition, newPos: LogicalPosition): void {
    }
}

export abstract class AbstractPluginEventListener implements PluginEventListener {
    onRegistered(editor: Editor, pluginManager: PluginManager): void {
    }
}

export interface GeneralEventListener extends VisualEventListener, EditorEventListener, PluginEventListener {
}

export abstract class AbstractGeneralEventListener implements GeneralEventListener {
    onSrLoaded(editor: Editor, ctx: TextContext, nodes: SRNode[], tokens: TokenStream<any>): void {
    }

    onAttached(editor: Editor, root: HTMLElement): void {
    }

    onRender(editor: Editor): void {
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

    onScroll(editor: Editor, event: WheelEvent): void {
    }

    onFocus(editor: Editor, event: FocusEvent): void {
    }

    onBlur(editor: Editor, event: FocusEvent): void {
    }

    onCaretMove(editor: Editor, caret: Caret, oldPos: LogicalPosition, newPos: LogicalPosition): void {
    }

    onCaretRemove(editor: Editor, caret: Caret): void {
    }

    onRegistered(editor: Editor, pluginManager: PluginManager): void {
    }
}


export type VisualEvent = keyof VisualEventListener;

export type EditorEvent = keyof EditorEventListener;

export type LangEvent = keyof LangEventListener;

export type PluginEvent = keyof PluginEventListener;

export type GeneralEvent = keyof GeneralEventListener;

export type ListenerType = (...args: any[]) => void;

type Tail<T extends any[]> = T extends [any, ...infer R] ? R : never;
export type EventArgs<T extends GeneralEvent> = Tail<Parameters<GeneralEventListener[T]>>;
export type LangEventArgs<T extends LangEvent> = Tail<Parameters<LangEventListener[T]>>;

export class EventManager {
    private visualListeners: VisualEventListener[] = [];
    private editorListeners: EditorEventListener[] = [];
    private langListeners: Record<string, LangEventListener[]> = {};
    private conditionalListeners: Map<Keybind, {
        listener: (editor: Editor, event: MouseEvent) => void,
        condition: (editor: Editor, event: MouseEvent) => boolean
    }> = new Map();
    private keybindingListeners: Map<Keybind, ListenerType> = new Map();

    addVisualEventListener(listener: VisualEventListener) {
        this.visualListeners.push(listener);
    }

    addEditorEventListener(listener: EditorEventListener) {
        this.editorListeners.push(listener);
    }

    addLangEventListener(lang: string, listener: LangEventListener) {
        if (!this.langListeners[lang]) {
            this.langListeners[lang] = [];
        }
        this.langListeners[lang].push(listener);
    }

    addKeybindingListener(keybinding: Keybind, listener: ListenerType) {
        this.keybindingListeners.set(keybinding, listener);
    }

    removeVisualEventListener(listener: VisualEventListener) {
        this.visualListeners.splice(this.visualListeners.indexOf(listener), 1)
    }

    fireKeybinding(event: KeyboardEvent, editor: Editor) {
        for (let [keybind, listener] of this.keybindingListeners.entries()) {
            if (this.matches(keybind, event)) {
                listener.apply(null, [editor, event]);
            }
        }
    }

    fireMouseKeybinding(event: MouseEvent, editor: Editor) {
        for (let [keybind, listener] of this.keybindingListeners.entries()) {
            if (this.matches(keybind, event)) {
                this.fireMouseKeybindingFor(listener, editor, event, keybind);
            }
        }
        for (let [keybind, {listener, condition}] of this.conditionalListeners.entries()) {
            if (this.matches(keybind, event) && condition(editor, event)) {
                this.fireMouseKeybindingFor(listener, editor, event, keybind);
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

    fireLangEvent(lang: string, event: keyof LangEventListener, ...args: any[]) {
        const listeners = this.langListeners[lang];
        if (listeners) {
            for (const listener of listeners) {
                const method = listener[event] as ListenerType;
                if (method) {
                    method.apply(listener, args);
                }
            }
        }
    }

    addConditionalEventListener(keybind: Keybind, listener: (editor: Editor, event: MouseEvent) => void, condition: (editor: Editor, event: MouseEvent) => boolean) {
        this.conditionalListeners.set(keybind, {listener, condition});
    }

    private fireMouseKeybindingFor(listener: ListenerType, editor: Editor, event: MouseEvent, keybind: Keybind) {
        if (event.button === 0) {
            if (keybind.key === Key.LeftClick) {
                listener.apply(null, [editor, event]);
            } else if (keybind.key === Key.LeftDoubleClick && event.detail === 2) {
                listener.apply(null, [editor, event]);
            } else if (keybind.key === Key.LeftTripleClick && event.detail === 3) {
                listener.apply(null, [editor, event]);
            }
        } else if (event.button === 1 && keybind.key === Key.MiddleClick) {
            listener.apply(null, [editor, event]);
        } else {
            if (keybind.key === Key.RightClick) {
                listener.apply(null, [editor, event]);
            } else if (keybind.key === Key.RightDoubleClick && event.detail === 2) {
                listener.apply(null, [editor, event]);
            }
        }
    }

    private matches(keybind: Keybind, event: KeyboardEvent | MouseEvent) {
        return (!("key" in event) || event.key === keybind.key)
            && (keybind.ctrl !== undefined ? event.ctrlKey === keybind.ctrl : true)
            && (keybind.alt !== undefined ? event.altKey === keybind.alt : true)
            && (keybind.shift !== undefined ? event.shiftKey === keybind.shift : true);
    }
}