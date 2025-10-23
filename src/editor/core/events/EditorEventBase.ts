import {EventBase} from "./EventBase";
import {Editor} from "../../Editor";

/**
 *
 * @author Atzitz Amos
 * @date 10/22/2025
 * @since 1.0.0
 */
export abstract class EditorEventBase implements EventBase {
    protected constructor(protected editor: Editor) {
    }

    public getEditor(): Editor {
        return this.editor;
    }
}
