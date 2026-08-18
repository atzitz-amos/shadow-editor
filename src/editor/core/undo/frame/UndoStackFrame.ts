import {TextRange} from "../../coordinate/range/TextRange";
import {UndoFrameAction} from "./UndoFrameAction";
import {Document} from "../../document/Document";
import {Editor} from "../../../Editor";
import {CaretMovementFlags} from "../../caret/Caret";

function getDelta(action: UndoFrameAction) {
    return action.kind === 'delete' ? -action.text.length : action.text.length;
}

/**
 *
 * @author Atzitz Amos
 * @date 8/17/2026
 * @since 1.0.0
 */
export class UndoStackFrame {
    private readonly name: string;
    private readonly transparent: boolean;

    private readonly actions: UndoFrameAction[] = [];
    private oldCaretPos: number | null = null;
    private newCaretPos: number | null = null;
    private oldSelection: TextRange | null = null;
    private newSelection: TextRange | null = null;

    constructor(name: string, transparent: boolean) {
        this.name = name;
        this.transparent = transparent;
    }

    canMergeWith(other: UndoStackFrame) {
        return this.transparent && other.transparent && other.name === this.name && this.newCaretPos === other.oldCaretPos;
    }

    merge(other: UndoStackFrame) {
        const myLast = this.actions[this.actions.length - 1];
        let index = 0;

        if (myLast) {
            let current = other.actions[0];
            while (current && current.kind === myLast.kind) {
                if (myLast.kind === 'delete') {
                    if (current.offset + current.text.length !== myLast.offset) break;
                    myLast.text = current.text + myLast.text;
                    myLast.offset -= current.text.length;
                } else {
                    if (current.offset !== myLast.offset + myLast.text.length) break;
                    myLast.text += current.text;
                }
                current = other.actions[index++];
            }
        }

        for (let i = index; i < other.actions.length; i++) {
            this.actions.push(other.actions[i]);
        }


        this.newCaretPos = other.newCaretPos;
        this.newSelection = other.newSelection;
    }

    addAction(kind: 'insert' | 'delete', offset: number, text: string) {
        this.actions.push({
            kind,
            offset,
            text
        });
    }


    undo(editor: Editor, document: Document): boolean {
        return this.restoringCaret(editor, () => {
            for (let i = this.actions.length - 1; i >= 0; i--) {
                const action = this.actions[i];
                if (action.kind === 'insert') {
                    document.deleteAt(action.offset, action.text.length);
                } else {
                    document.insertText(action.offset, action.text);
                }
            }
        }, this.oldCaretPos!, this.oldSelection, this.newCaretPos!, this.newSelection);
    }

    redo(editor: Editor, document: Document) {
        return this.restoringCaret(editor, () => {
            for (let i = 0; i < this.actions.length; i++) {
                const action = this.actions[i];
                if (action.kind === 'insert') {
                    document.insertText(action.offset, action.text);
                } else {
                    document.deleteAt(action.offset, action.text.length);
                }
            }
        }, this.newCaretPos!, this.newSelection, this.oldCaretPos!, this.oldSelection);
    }

    setOld(offset: number, range: TextRange | null) {
        this.oldCaretPos = offset;
        this.oldSelection = range;
    }

    setNew(offset: number, range: TextRange | null) {
        this.newCaretPos = offset;
        this.newSelection = range;
    }

    private restoringCaret(editor: Editor, action: () => void, oldCaretPos: Offset, oldSelection: TextRange | null, newCaretPos: Offset, newSelection: TextRange | null) {
        const selectionModel = editor.getPrimaryCaret().getSelectionModel();

        const caretMatch = editor.getPrimaryCaret().getOffset() === newCaretPos;
        const selectionMatch = newSelection === null
            ? !selectionModel.isSelectionActive
            : selectionModel.isSelectionActive && newSelection.is(selectionModel.getRange()!);

        if (!caretMatch || !selectionMatch) {
            editor.getPrimaryCaret().moveToOffset(newCaretPos, CaretMovementFlags.JUMP);
            if (newSelection) selectionModel.select(newSelection.start, newSelection.end);
            else selectionModel.clear();
            return false;
        }

        action();

        editor.getPrimaryCaret().moveToOffset(oldCaretPos!, CaretMovementFlags.JUMP);
        if (oldSelection) {
            editor.getPrimaryCaret().getSelectionModel().select(oldSelection.start, oldSelection.end);
        } else {
            editor.getPrimaryCaret().getSelectionModel().clear();
        }

        return true;
    }
}
