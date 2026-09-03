import {UndoStackFrame} from "./frame/UndoStackFrame";
import {Document} from "../document/Document";
import {UndoStack} from "./UndoStack";
import {Editor} from "../../Editor";

/**
 *
 * @author Atzitz Amos
 * @date 8/17/2026
 * @since 1.0.0
 */
export class UndoRedoActionStack {
    private readonly frameStack: UndoStackFrame[] = [];
    private readonly redoStack: UndoStackFrame[] = [];

    private currentFrame: UndoStackFrame | null = null;

    constructor(private readonly document: Document) {
    }

    public startUndoableAction(editor: Editor, name: string, transparent: boolean = false): boolean {
        if (this.currentFrame) return false;
        this.currentFrame = new UndoStackFrame(name, transparent);
        this.currentFrame.setOld(editor.getPrimaryCaret().getOffset(), editor.getPrimaryCaret().getSelectionModel().copyRange());

        this.redoStack.length = 0;

        return true;
    }

    public finishUndoableAction(editor: Editor) {
        if (!this.currentFrame) throw new Error("No undo frame to finish");
        const last = this.top();

        this.currentFrame.setNew(editor.getPrimaryCaret().getOffset(), editor.getPrimaryCaret().getSelectionModel().copyRange());
        if (last && last.canMergeWith(this.currentFrame)) {
            last.merge(this.currentFrame);
        } else {
            this.frameStack.push(this.currentFrame);
        }

        this.currentFrame = null;
    }

    public top(): UndoStackFrame {
        return this.frameStack[this.frameStack.length - 1];
    }

    public addInsert(offset: Offset, text: string) {
        if (UndoStack.undoing || !this.currentFrame) return;
        if (!this.currentFrame) {
            console.error("Attempting document modification without an active UndoActionStack");
            this.currentFrame = new UndoStackFrame("default", true);
        }
        this.currentFrame.addAction('insert', offset, text);
    }

    public addDelete(offset: Offset, text: string) {
        if (UndoStack.undoing) return;
        if (!this.currentFrame) {
            console.warn("Attempting document modification without an active UndoActionStack");
            this.currentFrame = new UndoStackFrame("default", true);
        }
        this.currentFrame.addAction('delete', offset, text);
    }

    undo(editor: Editor) {
        if (this.currentFrame) {
            console.warn("Uncommited undo action frame on undo attempt");
            this.finishUndoableAction(editor);
        }
        UndoStack.whileUndoing(() => {
            const frame = this.frameStack.pop();
            if (!frame) return;

            if (!frame.undo(editor, editor.getOpenedDocument()))
                this.frameStack.push(frame);
            else
                this.redoStack.push(frame);
        });
    }

    redo(editor: Editor) {
        if (this.currentFrame) {
            console.warn("Uncommited undo action frame on undo attempt");
            this.finishUndoableAction(editor);
        }
        UndoStack.whileUndoing(() => {
            const frame = this.redoStack.pop();
            if (!frame) return;

            if (!frame.redo(editor, editor.getOpenedDocument()))
                this.redoStack.push(frame);
            else
                this.frameStack.push(frame);
        });
    }

    discardFrame() {
        this.frameStack.pop();
    }
}
