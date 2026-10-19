import {Editor} from "../../editor/Editor";

/**
 *
 * @author Atzitz Amos
 * @date 10/4/2026
 * @since 1.0.0
 */
export class ActiveEditorHelper {
    private static readonly INSTANCE = new ActiveEditorHelper();
    private activeEditors: Map<number, Editor> = new Map();

    private activeEditor: Editor | null = null;

    private constructor() {
    }

    public static getActiveEditor(): Editor | null {
        return this.getInstance().activeEditor;
    }

    public static getEditorById(id: number): Editor | null {
        return this.getInstance().activeEditors.get(id) ?? null;
    }

    public static getAllEditors(): Editor[] {
        return Array.from(this.getInstance().activeEditors.values());
    }

    public static getInstance(): ActiveEditorHelper {
        return this.INSTANCE;
    }

    public setActiveEditor(editor: Editor) {
        this.activeEditor = editor;
    }

    public registerEditor(editor: Editor) {
        this.activeEditors.set(editor.getId(), editor);
    }

    public unregisterEditor(editor: Editor) {
        this.activeEditors.delete(editor.getId());
    }
}
