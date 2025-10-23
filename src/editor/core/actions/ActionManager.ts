import {Editor} from "../../Editor";
import {AbstractAction} from "./AbstractAction";

import {DeleteAction} from "../../actions/DeleteAction";
import {BackspaceAction, CtrlBackspaceAction} from "../../actions/BackspaceAction";
import * as MoveCaret from "../../actions/MoveCaret";
import {TabAction} from "../../actions/TabAction";
import {SelectAllAction, SelectDoubleClickAction} from "../../actions/SelectActions";


export class ActionManager {
    editor: Editor;
    actions: AbstractAction[] = [];

    constructor(editor: Editor) {
        this.editor = editor;

        // Register default actions
        this.addAction(new MoveCaret.MoveCaretLeftAction());
        this.addAction(new MoveCaret.MoveCaretRightAction());
        this.addAction(new MoveCaret.MoveCaretUpAction());
        this.addAction(new MoveCaret.MoveCaretDownAction());
        this.addAction(new MoveCaret.MoveCaretToStartAction());
        this.addAction(new MoveCaret.MoveCaretToEndAction());
        this.addAction(new MoveCaret.CtrlMoveCaretLeftAction());
        this.addAction(new MoveCaret.CtrlMoveCaretRightAction());
        this.addAction(new DeleteAction());
        this.addAction(new TabAction());
        this.addAction(new BackspaceAction());
        this.addAction(new CtrlBackspaceAction());
        this.addAction(new SelectAllAction());
        this.addAction(new SelectDoubleClickAction());
    }

    addAction(action: AbstractAction): void {
        this.actions.push(action);

        this.editor.getKeybindManager().registerAction(action, action.defaultKeybinding)
    }

    removeAction(action: AbstractAction) {
        const index = this.actions.indexOf(action);
        if (index !== -1) {
            this.actions.splice(index, 1);
            if (action.defaultKeybinding) {
                this.editor.getKeybindManager().unregisterAction(action);
            }
        }
    }
}


