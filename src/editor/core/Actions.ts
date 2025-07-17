import {Editor} from "../Editor";
import {AbstractVisualEventListener} from "./events/events";


/**
 * Event dispatcher */
export class Actions extends AbstractVisualEventListener {
    editor: Editor;

    constructor(editor: Editor) {
        super();

        this.editor = editor;

        this.editor.addVisualEventListener(this);
    }

    onInput(editor: Editor, event: InputEvent) {

    }

    onKeyDown(editor: Editor, event: KeyboardEvent) {

    }

    onKeyUp(editor: Editor, event: KeyboardEvent) {

    }
}