import {EditorPlugin} from "../loader/Plugin";
import {PluginManager} from "../PluginManager";
import {ExtensionPoint} from "./ExtensionPoint";
import {AbstractPane} from "../../../app/core/panes/pane/AbstractPane";
import {GlobalState} from "../../global/GlobalState";
import {IPane} from "../../../app/core/panes/pane/IPane";

/**
 *
 * @author Atzitz Amos
 * @date 6/3/2026
 * @since 1.0.0
 */
export class PanesExtensionPoint implements ExtensionPoint {
    private static readonly instance: PanesExtensionPoint = new PanesExtensionPoint();

    private readonly panes: Record<string, IPane[]> = {};

    static get class(): ExtensionPoint {
        return PanesExtensionPoint.instance;
    }

    getName(): string {
        return "panes";
    }

    register(manager: PluginManager, owner: EditorPlugin, instance: any): void {
        if (this.isIPane(instance)) {
            GlobalState.getPaneManager().add(instance);

            if (!this.panes[owner.constructor.name]) {
                this.panes[owner.constructor.name] = [];
            }
            this.panes[owner.constructor.name].push(instance);
        }
    }

    unregister(manager: PluginManager, owner: EditorPlugin): void {
        const panes = this.panes[owner.constructor.name];
        if (panes) {
            for (const pane of panes) {
                GlobalState.getPaneManager().remove(pane);
            }
            delete this.panes[owner.constructor.name];
        }
    }

    isIPane(instance: any): boolean {
        return instance instanceof AbstractPane;
    }

}
