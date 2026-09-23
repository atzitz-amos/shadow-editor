import {KeybindContextDescriptor} from "./KeybindContextDescriptor";
import {Editor} from "../../../editor/Editor";
import {IPane} from "../../../app/core/panes/pane/IPane";
import {KeybindNotApplicableAbortError} from "./KeybindNotApplicableAbortError";
import {KeybindEventLike} from "./KeybindEventLike";
import {DataContext} from "./data/DataContext";
import {DataKey} from "./data/DataKey";
import {DataProvider} from "./data/DataProvider";
import {CommonDataKeys} from "./data/CommonDataKeys";

/**
 *
 * @author Atzitz Amos
 * @date 11/17/2025
 * @since 1.0.0
 */
export class KeybindContext {
    private readonly editor: Editor | null;
    private readonly pane: IPane | null;
    private readonly data: DataContext;

    constructor(private readonly ctx: KeybindContextDescriptor, private readonly event: KeybindEventLike, editor: Editor | null = null, pane: IPane | null = null, data: DataContext = DataContext.EMPTY) {
        this.editor = editor;
        this.pane = pane;
        let contextData = data;
        if (editor && !contextData.has(CommonDataKeys.EDITOR)) contextData = contextData.with(CommonDataKeys.EDITOR, editor);
        if (pane && !contextData.has(CommonDataKeys.PANE)) contextData = contextData.with(CommonDataKeys.PANE, pane);
        const file = editor?.getOpenedFile();
        if (file && !contextData.has(CommonDataKeys.PROJECT_FILE)) contextData = contextData.with(CommonDataKeys.PROJECT_FILE, file);
        this.data = contextData;

        if (!editor && ctx & KeybindContextDescriptor.IN_MAIN_EDITOR) {
            throw new Error(`KeybindContextDescriptor.IN_MAIN_EDITOR requires an editor, but none was provided.`);
        }
        if (!pane && ctx & KeybindContextDescriptor.IN_PANE) {
            throw new Error(`KeybindContextDescriptor.IN_PANE requires a pane, but none was provided.`);
        }
    }

    public static fromEditor(editor: Editor, event: KeyboardEvent | MouseEvent) {
        return new KeybindContext(KeybindContextDescriptor.IN_MAIN_EDITOR | KeybindContextDescriptor.IN_TEXT_AREA, event, editor, null);
    }

    public requireEditor(): Editor {
        return this.require(CommonDataKeys.EDITOR);
    }

    public isTextAreaEvent(): boolean {
        return (this.ctx & KeybindContextDescriptor.IN_TEXT_AREA) !== 0;
    }

    public isEditorEvent(): boolean {
        return (this.ctx & KeybindContextDescriptor.IN_MAIN_EDITOR) !== 0;
    }

    public isPaneEvent(): boolean {
        return (this.ctx & KeybindContextDescriptor.IN_PANE) !== 0;
    }

    public isMainWindowEvent(): boolean {
        return (this.ctx & KeybindContextDescriptor.IN_MAIN_WINDOW) !== 0;
    }

    public requirePane(): IPane {
        return this.require(CommonDataKeys.PANE);
    }

    public applies(descriptor: KeybindContextDescriptor) {
        return descriptor & this.ctx;
    }

    public getEvent(): KeybindEventLike {
        return this.event;
    }

    public abort(): void {
        throw new KeybindNotApplicableAbortError();
    }

    public get<T>(key: DataKey<T>): T | undefined {
        return this.data.get(key);
    }

    public has<T>(key: DataKey<T>): boolean {
        return this.data.has(key);
    }

    public require<T>(key: DataKey<T>): T {
        return this.data.require(key);
    }

    public with<T>(key: DataKey<T>, value: T): KeybindContext {
        return new KeybindContext(this.ctx, this.event, this.editor, this.pane, this.data.with(key, value));
    }

    public withLazy<T>(key: DataKey<T>, provider: DataProvider<T> | (() => T)): KeybindContext {
        return new KeybindContext(this.ctx, this.event, this.editor, this.pane, this.data.withLazy(key, provider));
    }
}
