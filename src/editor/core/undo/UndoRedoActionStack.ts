import {UndoableAction} from "./actions/UndoableAction";
import {Caret} from "../caret/Caret";
import {DeleteTextAction} from "./actions/text/DeleteTextAction";
import {InsertTextAction} from "./actions/text/InsertTextAction";
import {TextEditAction} from "./actions/text/TextEditAction";
import {BulkTextEditAction} from "./actions/text/BulkTextEditAction";
import {TextRange} from "../coordinate/range/TextRange";
import {ReplaceTextAction} from "./actions/text/ReplaceTextAction";

/**
 *
 * @author Atzitz Amos
 * @date 6/5/2026
 * @since 1.0.0
 */
class PartialEdit {
    public constructor(public readonly type: "insert" | "delete", public readonly offset: number, public text: string) {
    }

    public getNewLocation(): number {
        if (this.type === "insert") {
            return this.offset + this.text.length;
        } else {
            return this.offset;
        }
    }

    appendText(text: string) {
        this.text += text;
    }
}

export class UndoRedoActionStack {
    private head: UndoableActionStackNode = UndoableActionStackNode.head();
    private current: UndoableActionStackNode = this.head;

    private partialEdits: Map<Caret, PartialEdit> = new Map();

    push(action: UndoableAction) {
        const newNode = new UndoableActionStackNode(action);
        if (this.current) {
            this.current.linkNext(newNode);
        } else {
            this.head.linkNext(newNode);
        }
        this.current = newNode;
    }

    getCurrent(): UndoableAction | null {
        return this.current.action;
    }

    getNext() {
        return this.current.next ? this.current.next.action : null;
    }

    undo() {
        if (this.current.prev) {
            this.current = this.current.prev;
        }
    }

    redo() {
        if (this.current.next) {
            this.current = this.current.next;
        }
    }

    clear() {
        this.current = this.head;
        this.partialEdits.clear();
    }

    canUndo() {
        return this.current !== this.head;
    }

    canRedo() {
        return this.current.next !== null;
    }

    public onTyped(caret: Caret, offset: Offset, text: string) {
        let existing = this.partialEdits.get(caret);
        if (existing && (existing.type !== "insert" || existing.getNewLocation() !== offset)) {
            this.commitPartialEdits();
            existing = undefined;
        }

        if (!existing) {
            this.partialEdits.set(caret, new PartialEdit("insert", offset, text));
        } else {
            existing.appendText(text);
        }
    }

    public onDeleted(caret: Caret, offset: Offset, text: string) {
        let existing = this.partialEdits.get(caret);
        if (existing && (existing.type !== "delete" || existing.getNewLocation() !== offset)) {
            this.commitPartialEdits();
            existing = undefined;
        }

        if (!existing) {
            this.partialEdits.set(caret, new PartialEdit("delete", offset, text));
        } else {
            existing.appendText(text);
        }
    }

    public commitPartialEdits() {
        if (this.partialEdits.size > 0) {
            const edits: TextEditAction[] = [];
            for (const [caret, edit] of this.partialEdits.entries()) {
                if (edit.type === "insert") edits.push(new InsertTextAction(edit.offset, edit.text, caret.isPrimary));
                else edits.push(new DeleteTextAction(edit.offset, edit.text, caret.isPrimary));
            }

            this.push(new BulkTextEditAction(edits));
        }

        this.partialEdits.clear();
    }

    public printAll() {
        let node: UndoableActionStackNode = this.current;
        const actions: UndoableAction[] = [];
        while (node !== this.head) {
            if (node.action) actions.push(node.action);
            node = node.prev;
        }
        console.log(actions.reverse());
    }

    onReplaced(caret: Caret, old: Offset, range: TextRange, oldText: string, newText: string) {
        this.commitPartialEdits();
        this.push(new BulkTextEditAction([new ReplaceTextAction(old, caret.getOffset(), range, oldText, newText)]));
    }
}

class UndoableActionStackNode {
    action: UndoableAction | null;
    prev: UndoableActionStackNode;
    next: UndoableActionStackNode | null = null;

    constructor(action: UndoableAction | null) {
        this.action = action;
    }

    static head() {
        const head = new UndoableActionStackNode(null);
        head.prev = head;
        return head;
    }

    linkNext(node: UndoableActionStackNode) {
        this.next = node;
        node.prev = this; // so we can safely assume prev is always set
    }
}
