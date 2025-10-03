import {Editor} from "../Editor";
import {DeleteAction} from "./DeleteAction";
import {BackspaceAction, CtrlBackspaceAction} from "./BackspaceAction";
import {AbstractAction} from "./AbstractAction";
import {
    CtrlMoveCaretLeftAction,
    CtrlMoveCaretRightAction,
    MoveCaretDownAction,
    MoveCaretLeftAction,
    MoveCaretRightAction,
    MoveCaretToEndAction,
    MoveCaretToStartAction,
    MoveCaretUpAction
} from "./MoveCaret";
import {TabAction} from "./TabAction";
import {SelectAllAction, SelectDoubleClickAction} from "./SelectActions";


export class ActionManager {
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
        this.addAction(new CtrlMoveCaretLeftAction());
        this.addAction(new CtrlMoveCaretRightAction());
        this.addAction(new DeleteAction());
        this.addAction(new TabAction());
        this.addAction(new BackspaceAction());
        this.addAction(new CtrlBackspaceAction());
        this.addAction(new SelectAllAction());
        this.addAction(new SelectDoubleClickAction());
    }

    addAction(action: AbstractAction): void {
        this.actions.push(action);
        if (action.keybinding) {
            this.editor.eventsManager.addKeybindingListener(action.keybinding, action.run);
        }
    }
}


