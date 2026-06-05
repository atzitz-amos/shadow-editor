import {Editor} from "../../../../Editor";
import {Caret} from "../../../caret/Caret";

/**
 *
 * @author Atzitz Amos
 * @date 6/5/2026
 * @since 1.0.0
 */
export abstract class TextEditAction {
    public constructor(protected readonly offset: number, protected readonly affectedDelta: number, private readonly primaryCaret: boolean) {

    }

    getOldOffset(): number {
        return this.offset;
    }

    abstract getNewOffset();

    getAffectedDelta(): number {
        return this.affectedDelta;
    }

    wasPrimaryCaret(): boolean {
        return this.primaryCaret;
    }

    abstract redo(editor: Editor, caret: Caret): void;

    abstract undo(editor: Editor, caret: Caret): void;
}

