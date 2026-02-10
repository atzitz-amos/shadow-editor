import {PluginManager} from "../PluginManager";
import {ExtensionPoint} from "./ExtensionPoint";
import {EditorPlugin} from "../loader/Plugin";
import {AbstractAction} from "../../actions/AbstractAction";
import {GlobalState} from "../../global/GlobalState";


export class ActionsExtensionPoint implements ExtensionPoint {
    private static readonly instance: ActionsExtensionPoint = new ActionsExtensionPoint();

    private readonly actions: Record<string, AbstractAction[]> = {};

    static get class(): ExtensionPoint {
        return ActionsExtensionPoint.instance;
    }

    getName(): string {
        return "actions";
    }

    register(manager: PluginManager, owner: EditorPlugin, action: AbstractAction): void {
        GlobalState.getActionManager().addAction(action);

        if (!this.actions[owner.constructor.name]) {
            this.actions[owner.constructor.name] = [];
        }
        this.actions[owner.constructor.name].push(action);
    }

    unregister(manager: PluginManager, owner: EditorPlugin): void {
        let actions = this.actions[owner.constructor.name];
        if (actions) {
            delete this.actions[owner.constructor.name];
            for (let action of actions) {
                GlobalState.getActionManager().removeAction(action);
            }
        }
    }
}