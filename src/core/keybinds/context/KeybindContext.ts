import {KeybindContextDescriptor} from "./KeybindContextDescriptor";
import {Editor} from "../../../editor/Editor";

/**
 *
 * @author Atzitz Amos
 * @date 11/17/2025
 * @since 1.0.0
 */
export class KeybindContext {
    private readonly editor: Editor | null;
    private readonly pane: any; // TODO: pane


    constructor(private readonly ctx: KeybindContextDescriptor, private readonly event: KeyboardEvent | MouseEvent, editor: Editor | null = null, pane: any = null) {
        this.editor = editor;
        this.pane = pane;

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
        if (!this.editor)
            throw new Error(`No editor associated with this KeybindContext.`);
        return this.editor;
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

    public requirePane(): any {
        if (!this.pane)
            throw new Error(`No pane associated with this KeybindContext.`);
        return this.pane;
    }

    public applies(descriptor: KeybindContextDescriptor) {
        return descriptor & this.ctx;
    }

    public getEvent() {
        return this.event;
    }
}
