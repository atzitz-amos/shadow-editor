import {Editor} from "../../Editor";
import {DeleteAction} from "./DeleteAction";
import {BackspaceAction} from "./BackspaceAction";
import {AbstractAction} from "./AbstractAction";
import {
    MoveCaretDownAction,
    MoveCaretLeftAction,
    MoveCaretRightAction,
    MoveCaretToEndAction,
    MoveCaretToStartAction,
    MoveCaretUpAction
} from "./MoveCaret";
import {TabAction} from "./TabAction";
import {SelectAllAction} from "./SelectActions";


export class Actions {
    editor: Editor;
    actions: AbstractAction[] = [];

    constructor(editor: Editor) {
        this.editor = editor;

        // Register default actions
        this.addAction(new MoveCaretLeftAction());
        this.addAction(new MoveCaretRightAction());
        this.addAction(new MoveCaretUpAction());
        this.addAction(new MoveCaretDownAction());
        this.addAction(new MoveCaretToStartAction());
        this.addAction(new MoveCaretToEndAction());
        this.addAction(new DeleteAction());
        this.addAction(new TabAction());
        this.addAction(new BackspaceAction());
        this.addAction(new SelectAllAction());
    }

    addAction(action: AbstractAction): void {
        this.actions.push(action);
        if (action.keybinding) {
            this.editor.eventsManager.addKeybindingListener(action.keybinding, action.run);
        }
    }
}


