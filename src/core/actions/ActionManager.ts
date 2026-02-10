import {AbstractAction} from "./AbstractAction";

import {DeleteAction} from "../../editor/actions/DeleteAction";
import {BackspaceAction, CtrlBackspaceAction} from "../../editor/actions/BackspaceAction";
import * as MoveCaret from "../../editor/actions/MoveCaret";
import {TabAction} from "../../editor/actions/TabAction";
import {SelectAllAction, SelectDoubleClickAction} from "../../editor/actions/SelectActions";
import {KeybindManager} from "../keybinds/KeybindManager";
import {Service} from "../lifecycle/Service";
import {Logger, UseLogger} from "../logging/Logger";


@Service
@UseLogger("ActionManager")
export class ActionManager {
    private static instance: ActionManager;
    actions: AbstractAction[] = [];
    private declare readonly logger: Logger;

    public static getInstance() {
        if (!ActionManager.instance) {
            ActionManager.instance = new ActionManager();
        }
        return ActionManager.instance;
    }

    addAction(action: AbstractAction): void {
        this.actions.push(action);

        KeybindManager.getInstance().registerAction(action, action.defaultKeybinding)
    }

    removeAction(action: AbstractAction) {
        const index = this.actions.indexOf(action);
        if (index !== -1) {
            this.actions.splice(index, 1);
            if (action.defaultKeybinding) {
                KeybindManager.getInstance().unregisterAction(action);
            }
        }
    }

    begin() {
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

        this.logger.info("Successfully registered default actions.");
    }
}


