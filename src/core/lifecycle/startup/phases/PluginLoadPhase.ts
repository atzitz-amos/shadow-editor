import {AbstractStartupPhase} from "../StartupPhase";
import {PluginManager} from "../../../plugins/PluginManager";

/**
 * Phase that loads and initializes all plugins.
 * This runs first (priority 10) since other services may depend on plugins.
 *
 * @author Atzitz Amos
 * @date 2/3/2026
 * @since 1.0.0
 */
export class PluginLoadPhase extends AbstractStartupPhase {
    readonly name = "Loading Plugins";
    readonly priority = 10;
    readonly critical = true;

    async run(): Promise<void> {
        const pluginManager = PluginManager.getInstance();
        await pluginManager.beginAsync();
    }
}

