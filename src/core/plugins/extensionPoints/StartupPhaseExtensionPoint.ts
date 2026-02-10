import {PluginManager} from "../PluginManager";
import {ExtensionPoint} from "./ExtensionPoint";
import {EditorPlugin} from "../loader/Plugin";
import {StartupPhase} from "../../lifecycle/startup/StartupPhase";
import {Lifecycle} from "../../lifecycle/Lifecycle";

/**
 * Extension point for registering custom startup phases.
 * Plugins can use this to add their own initialization phases to the startup sequence.
 *
 * Note: Phases must be registered before Lifecycle.start() is called.
 * The plugin loading phase runs early (priority 10), so plugin-registered phases
 * should use priority > 10 to run after plugins are loaded.
 *
 * @author Atzitz Amos
 * @date 2/3/2026
 * @since 1.0.0
 */
export class StartupPhaseExtensionPoint implements ExtensionPoint {
    private static readonly instance: StartupPhaseExtensionPoint = new StartupPhaseExtensionPoint();

    private readonly phases: Record<string, StartupPhase[]> = {};

    static get class(): ExtensionPoint {
        return StartupPhaseExtensionPoint.instance;
    }

    getName(): string {
        return "startupPhase";
    }

    register(manager: PluginManager, owner: EditorPlugin, phase: StartupPhase): void {
        // Register the phase with Lifecycle
        Lifecycle.getInstance().registerPhase(phase);

        // Track phases by plugin for potential unregistration
        if (!this.phases[owner.constructor.name]) {
            this.phases[owner.constructor.name] = [];
        }
        this.phases[owner.constructor.name].push(phase);
    }

    unregister(manager: PluginManager, owner: EditorPlugin): void {
        // Note: Phases cannot be unregistered after startup has begun.
        // This is tracked for potential future support of hot-reloading plugins.
        const phases = this.phases[owner.constructor.name];
        if (phases) {
            delete this.phases[owner.constructor.name];
            // Phases registered after startup will be ignored by Lifecycle,
            // and phases already registered cannot be removed from the running sequence.
        }
    }
}

