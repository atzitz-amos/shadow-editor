import {PersistedObject} from "../persistence/transaction/PersistedObject";
import {ServiceImpl} from "./Service";
import {Logger, UseLogger} from "../logging/Logger";
import {StartupPhase} from "./startup/StartupPhase";
import {StartupProgressEvent} from "./events/StartupProgressEvent";
import {StartupFailedEvent} from "./events/StartupFailedEvent";
import {EventBus} from "../events/EventBus";
import {ShadowApp} from "../../app/ShadowApp";
import {LifecycleStartedEvent} from "./events/LifecycleStartedEvent";

/**
 * The lifecycle of the application, manages the persistence of PersistedObject,
 * the automatic running of Services, startup phases, and other lifecycle related tasks.
 *
 * @author Atzitz Amos
 * @date 12/29/2025
 * @since 1.0.0
 */
@UseLogger("Lifecycle")
export class Lifecycle {
    private static _instance: Lifecycle;
    declare private logger: Logger;

    private readonly services: ServiceImpl[] = [];
    private readonly persistedObjects: PersistedObject<any>[] = [];
    private readonly phases: StartupPhase[] = [];

    private started: boolean = false;
    private phasesLocked: boolean = false;
    private startupAborted: boolean = false;

    public constructor() {
        // No longer auto-start with queueMicrotask
    }

    static getInstance(): Lifecycle {
        if (!this._instance) {
            this._instance = new Lifecycle();
        }
        return this._instance;
    }

    /**
     * Register a service to be started during the ServiceBeginPhase.
     */
    addService(instance: ServiceImpl) {
        this.services.push(instance);
    }

    /**
     * Register a persisted object to be recovered during the PersistenceRecoveryPhase.
     */
    addPersistedObject(obj: PersistedObject<any>) {
        this.persistedObjects.push(obj);
    }

    /**
     * Register a custom startup phase.
     * Phases are sorted by priority and executed in order.
     *
     * Note: Phases can only be registered before startup begins or during the PluginLoadPhase.
     * After PluginLoadPhase completes, phase registration is locked.
     *
     * @param phase The startup phase to register
     * @returns true if the phase was registered, false if registration is locked
     */
    registerPhase(phase: StartupPhase): boolean {
        if (this.phasesLocked) {
            this.logger.warn(`Cannot register phase "${phase.name}": phase registration is locked after plugin loading completes.`);
            return false;
        }
        this.phases.push(phase);
        return true;
    }

    /**
     * Lock phase registration. Called after PluginLoadPhase completes.
     * After this, no more phases can be registered.
     */
    lockPhaseRegistration(): void {
        this.phasesLocked = true;
        this.logger.debug("Phase registration is now locked.");
    }

    /**
     * Check if phase registration is locked.
     */
    isPhasesLocked(): boolean {
        return this.phasesLocked;
    }

    /**
     * Start the lifecycle with the given ShadowApp instance.
     * Registers built-in phases and executes all phases in priority order.
     * @param app The ShadowApp instance
     * @returns A promise that resolves when startup is complete
     */
    async start(app: ShadowApp): Promise<boolean> {
        if (this.started) {
            this.logger.warn("Lifecycle has already been started");
            return !this.startupAborted;
        }

        console.group("Startup");
        this.logger.info("Lifecycle starting...");

        // Load plugins first (before registering other phases)
        // This allows plugins to register their own startup phases
        const pluginsLoaded = await this.loadPlugins();
        if (!pluginsLoaded) {
            return false;
        }

        // Lock phase registration after plugins are loaded
        this.lockPhaseRegistration();

        // Register built-in phases
        await this.registerBuiltInPhases(app);

        this.started = true;

        // Sort phases by priority (lower priority runs first)
        this.phases.sort((a, b) => a.priority - b.priority);

        const eventBus = EventBus.getMainEventBus();
        const totalPhases = this.phases.length;

        // Execute phases sequentially
        for (let i = 0; i < this.phases.length; i++) {
            const phase = this.phases[i];

            // Emit progress event (phase starting)
            eventBus.syncPublish(new StartupProgressEvent(phase.name, i, totalPhases, false));

            this.logger.info(`Running phase [${i + 1}/${totalPhases}]: ${phase.name}`);

            try {
                await phase.run();
                // Emit progress event (phase completed)
                eventBus.syncPublish(new StartupProgressEvent(phase.name, i, totalPhases, true));
            } catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                const isCritical = phase.critical !== false;

                this.logger.error(`Phase "${phase.name}" failed: ${err.message}`);
                eventBus.syncPublish(new StartupFailedEvent(phase, err, isCritical));

                if (isCritical) {
                    this.logger.error("Startup aborted due to critical phase failure");
                    this.startupAborted = true;
                    console.groupEnd();
                    return false;
                }
            }
        }

        eventBus.syncPublish(new LifecycleStartedEvent());
        this.logger.info("Lifecycle started successfully.");
        console.groupEnd();

        return true;
    }

    /**
     * Check if startup was aborted due to a critical phase failure.
     */
    isStartupAborted(): boolean {
        return this.startupAborted;
    }

    /**
     * Check if startup has been initiated.
     */
    hasStarted(): boolean {
        return this.started;
    }

    /**
     * Get all registered services.
     */
    getServices(): readonly ServiceImpl[] {
        return this.services;
    }

    /**
     * Get all registered persisted objects.
     */
    getPersistedObjects(): readonly PersistedObject<any>[] {
        return this.persistedObjects;
    }

    private async registerBuiltInPhases(app: ShadowApp) {
        // Dynamic imports to avoid circular dependency with @Service decorator
        const { PersistenceRecoveryPhase } = await import("./startup/phases/PersistenceRecoveryPhase");
        const { ServiceBeginPhase } = await import("./startup/phases/ServiceBeginPhase");
        const { AppReadyPhase } = await import("./startup/phases/AppReadyPhase");

        // Priority 20: Recover persisted data
        this.phases.push(new PersistenceRecoveryPhase(this.persistedObjects));

        // Priority 30: Start services
        this.phases.push(new ServiceBeginPhase(this.services));

        // Priority 100: Mark app as ready
        this.phases.push(new AppReadyPhase(app));
    }

    private async loadPlugins(): Promise<boolean> {
        const { PluginLoadPhase } = await import("./startup/phases/PluginLoadPhase");
        const eventBus = EventBus.getMainEventBus();
        const phase = new PluginLoadPhase();

        eventBus.syncPublish(new StartupProgressEvent(phase.name, 0, 1, false));

        try {
            await phase.run();
            // Emit progress event (phase completed)
            eventBus.syncPublish(new StartupProgressEvent(phase.name, 0, 1, true));
            return true;
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));

            this.logger.error(`Phase "${phase.name}" failed: ${err.message}`);
            eventBus.syncPublish(new StartupFailedEvent(phase, err, true));

            this.logger.error("Startup aborted due to critical plugin loading failure");
            this.startupAborted = true;
            console.groupEnd();
            return false;
        }
    }
}
