import {EditorBehaviorContext} from "./EditorBehaviorContext";
import {Editor} from "../../../Editor";
import {Caret} from "../../caret/Caret";

/**
 *
 * @author Atzitz Amos
 * @date 6/25/2026
 * @since 1.0.0
 */
export class EditorCharTypedContext extends EditorBehaviorContext {

    constructor(editor: Editor, caret: Caret, private readonly content: string, private readonly moveCaret: boolean) {
        super(editor, caret);
    }

    getContent(): string {
        return this.content;
    }

    shouldMoveCaret(): boolean {
        return this.moveCaret;
    }
}
