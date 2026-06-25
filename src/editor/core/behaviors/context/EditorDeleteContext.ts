import {EditorBehaviorContext} from "./EditorBehaviorContext";
import {Editor} from "../../../Editor";
import {Caret} from "../../caret/Caret";

/**
 *
 * @author Atzitz Amos
 * @date 6/25/2026
 * @since 1.0.0
 */
export class EditorDeleteContext extends EditorBehaviorContext {

    constructor(editor: Editor, caret: Caret, private readonly offset: Offset, private readonly count: number) {
        super(editor, caret);
    }

    getDeleteText(): string {
        if (this.count <= 0) return this.getEditor().getOpenedDocument().getTextBetween(this.offset + this.count, this.offset);
        return this.getEditor().getOpenedDocument().getTextBetween(this.offset, this.offset + this.count);
    }

    getDeleteOffset(): Offset {
        return this.offset;
    }

    getDeleteCount(): number {
        return this.count;
    }
}
