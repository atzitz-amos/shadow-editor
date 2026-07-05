import {Logger} from "../../../../core/logging/logger/LoggerCore";
import {AbstractAction} from "../../../../core/actions/AbstractAction";
import {ActionManager} from "../../../../core/actions/ActionManager";
import {ThreadedUtils} from "../../../../core/threaded/ThreadedUtils";

export class DefaultActionsRegistry {
    private static readonly logger: Logger = Logger.for("DefaultActionsRegistry");

    private static isLoaded = false;

    public static ensureLoaded() {
        if (ThreadedUtils.isWorkerThread() || this.isLoaded) {
            return;
        }
        this.isLoaded = true;

        const modules = import.meta.glob('../*.ts', {eager: true});
        let registeredCount = 0;

        for (const path in modules) {
            const moduleExports = modules[path] as Record<string, any>;

            for (const key in moduleExports) {
                const exportedItem = moduleExports[key];

                if (typeof exportedItem === "function" && exportedItem.prototype instanceof AbstractAction) {
                    ActionManager.getInstance().addDefaultAction(new exportedItem());
                    registeredCount++;
                }
            }
        }

        this.logger.info(`Successfully registered ${registeredCount} default actions.`);
    }
}