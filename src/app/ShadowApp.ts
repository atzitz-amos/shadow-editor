import {ShadowUIFactory} from "./ui/ShadowUIFactory";
import {GlobalState} from "../core/global/GlobalState";
import {Lifecycle} from "../core/lifecycle/Lifecycle";
import {Workspace} from "../core/workspace/Workspace";
import {GlobalProject} from "../core/global/GlobalProject";
import {EditorPlugin} from "../core/plugins/loader/Plugin";
import {ShadowUI} from "./ui/ShadowUI";
import {ShadowUILoadedEvent} from "./events/ShadowUILoadedEvent";

/**
 * Represents the backend of the Shadow Editor application. It is responsible for managing
 * the app's lifecycle, processes, and providing access to core services.
 *
 * @author Atzitz Amos
 * @date 11/2/2025
 * @since 1.0.0
 */
export class ShadowApp {
    private static isRunning = false;
    private static instance: ShadowApp;

    private ui: ShadowUI | undefined = undefined;


    private constructor() {
        GlobalState.getMainEventBus().subscribe(this, ShadowUILoadedEvent.SUBSCRIBER, (ev) => {
            this.ui = ev.getShadowUI();
        });
    }

    /**
     * Launch the ShadowApp. This is the single entry point for the application.
     * Initializes the UI (with progress bar), runs all startup phases via Lifecycle,
     * and resolves when the app is fully ready.
     *
     * @returns A promise that resolves to true if startup succeeded, false if aborted.
     */
    public static async launch(showProgressBar: boolean): Promise<ShadowApp | undefined> {
        if (ShadowApp.isRunning) {
            throw new Error("Shadow app is already running");
        }

        // Create the app instance
        ShadowApp.instance = new ShadowApp();

        // Initialize GlobalState with the app
        GlobalState.init(ShadowApp.instance);

        if (showProgressBar)
            // Launch the UI (this will display the progress bar)
            ShadowUIFactory.showLaunchComponent();

        // Get the lifecycle instance (creates it if needed)
        const lifecycle = Lifecycle.getInstance();

        // Run all startup phases
        const success = await lifecycle.start(ShadowApp.instance);

        if (success) {
            ShadowApp.isRunning = true;
            return ShadowApp.instance;
        }

        return undefined;
    }

    /**
     * Get the running ShadowApp instance.
     * @throws Error if the app has not been launched yet.
     */
    public static getInstance(): ShadowApp {
        if (!ShadowApp.instance) {
            throw new Error("ShadowApp has not been launched yet. Call ShadowApp.launch() first.");
        }
        return ShadowApp.instance;
    }

    public enable(plugin: Class<EditorPlugin>): void {
        GlobalState.getPluginManager().enable(plugin);
    }

    /**
     * Open a project.*/
    public openProject(project: Workspace): void {
        GlobalProject.open(project);
    }

    getUI(): ShadowUI | undefined {
        return this.ui;
    }
}