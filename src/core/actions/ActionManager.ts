import {AbstractAction} from "./AbstractAction";
import {KeybindManager} from "../keybinds/KeybindManager";
import {Service} from "../threaded/service/Service";
import {Logger, UseLogger} from "../logging/Logger";
import {ExtensionPoint} from "../plugins/extensionPoints/ExtensionPoint";
import {EditorPlugin} from "../plugins/loader/Plugin";
import {Scheduler} from "../scheduler/Scheduler";


@Service
@UseLogger("ActionManager")
export class ActionManager {
    private static readonly actionEP = new ExtensionPoint("actions", AbstractAction)
        .onContribute((p, action) => ActionManager.getInstance().addAction(p, action))
        .onWithdraw(p => ActionManager.getInstance().removeActionsByPlugin(p));

    private static instance: ActionManager;

    declare private readonly logger: Logger;
    private readonly actions: Map<string | null, AbstractAction[]> = new Map<string | null, AbstractAction[]>();

    private readonly actionsToInitialize: AbstractAction[] = []

    public static getInstance() {
        if (!ActionManager.instance) {
            ActionManager.instance = new ActionManager();
        }
        return ActionManager.instance;
    }

    public static fromCls<T extends AbstractAction>(cls: Class<T>): T {
        return this.actionEP.getAll().find(action => action instanceof cls) as T;
    }

    addAction(plugin: EditorPlugin | null, action: AbstractAction): void {
        const key = plugin?.getId() ?? null;

        if (!this.actions.has(key)) {
            this.actions.set(key, []);
        }
        this.actions.get(key)!.push(action);
        KeybindManager.getInstance().registerAction(action, action.getDefaultKeybinding())
        
        this.actionsToInitialize.push(action)
        Scheduler.debounce(() => {
            this.actionsToInitialize.forEach(action => action.addToGroups());
            this.actionsToInitialize.length = 0;
        }, 10);
    }

    /** Returns whether this action is still active or if it was disabled by removeActionsByPlugin*/
    isActionActive(action: AbstractAction): boolean {
        for (const actions of this.actions.values()) {
            if (actions.includes(action)) {
                return true;
            }
        }
        return false;
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
    }
}


