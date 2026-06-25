import {AbstractAction} from "./AbstractAction";

import {DeleteAction} from "../../editor/impl/actions/DeleteAction";
import {BackspaceAction, CtrlBackspaceAction} from "../../editor/impl/actions/BackspaceAction";
import * as MoveCaret from "../../editor/impl/actions/MoveCaret";
import {TabAction} from "../../editor/impl/actions/TabAction";
import {
    SelectAllAction,
    SelectDoubleClickAction,
    SelectTripleClickAction
} from "../../editor/impl/actions/SelectActions";
import {KeybindManager} from "../keybinds/KeybindManager";
import {Service} from "../threaded/service/Service";
import {Logger, UseLogger} from "../logging/Logger";
import {CopyAction, CutAction, PasteAction} from "../../editor/impl/actions/ClipboardActions";
import {EnterAction} from "../../editor/impl/actions/EnterAction";
import {RedoAction, UndoAction} from "../../editor/impl/actions/UndoRedoActions";
import {ApplyQuickFixAction} from "../../editor/impl/actions/ApplyQuickFixAction";
import {ExtensionPoint} from "../plugins/extensionPoints/ExtensionPoint";
import {EditorPlugin} from "../plugins/loader/Plugin";


@Service
@UseLogger("ActionManager")
export class ActionManager {
    private static readonly actionEP = new ExtensionPoint("actions", AbstractAction)
        .onContribute((p, action) => ActionManager.getInstance().addAction(p, action))
        .onWithdraw(p => ActionManager.getInstance().removeActionsByPlugin(p));

    private static instance: ActionManager;
    declare private readonly logger: Logger;

    private readonly actions: Map<string | null, AbstractAction[]> = new Map<string | null, AbstractAction[]>();

    public static getInstance() {
        if (!ActionManager.instance) {
            ActionManager.instance = new ActionManager();
        }
        return ActionManager.instance;
    }

    addAction(plugin: EditorPlugin | null, action: AbstractAction): void {
        const key = plugin?.getId() ?? null;

        if (!this.actions.has(key)) {
            this.actions.set(key, []);
        }
        this.actions.get(key)!.push(action);

        KeybindManager.getInstance().registerAction(action, action.defaultKeybinding)
    }

    removeActionsByPlugin(plugin: EditorPlugin) {
        const key = plugin.getId();
        const actions = this.actions.get(key);
        if (actions) {
            for (const action of actions) {
                KeybindManager.getInstance().unregisterAction(action);
            }
            this.actions.delete(key);
        }
    }

    addDefaultAction(action: AbstractAction) {
        this.addAction(null, action);
    }

    begin() {
        // Register default actions
        this.addDefaultAction(new MoveCaret.MoveCaretLeftAction());
        this.addDefaultAction(new MoveCaret.MoveCaretRightAction());
        this.addDefaultAction(new MoveCaret.MoveCaretUpAction());
        this.addDefaultAction(new MoveCaret.MoveCaretDownAction());
        this.addDefaultAction(new MoveCaret.MoveCaretToStartAction());
        this.addDefaultAction(new MoveCaret.MoveCaretToEndAction());
        this.addDefaultAction(new MoveCaret.CtrlMoveCaretLeftAction());
        this.addDefaultAction(new MoveCaret.CtrlMoveCaretRightAction());
        this.addDefaultAction(new DeleteAction());
        this.addDefaultAction(new TabAction());
        this.addDefaultAction(new EnterAction());
        this.addDefaultAction(new BackspaceAction());
        this.addDefaultAction(new CtrlBackspaceAction());
        this.addDefaultAction(new SelectAllAction());
        this.addDefaultAction(new SelectDoubleClickAction());
        this.addDefaultAction(new SelectTripleClickAction());
        this.addDefaultAction(new CopyAction());
        this.addDefaultAction(new CutAction());
        this.addDefaultAction(new PasteAction());
        this.addDefaultAction(new UndoAction());
        this.addDefaultAction(new RedoAction());

        this.addDefaultAction(new ApplyQuickFixAction());

        this.logger.info("Successfully registered default actions.");
    }
}


