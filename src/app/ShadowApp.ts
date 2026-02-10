import {ShadowUI} from "./ui/ShadowUI";
import {GlobalState} from "../core/global/GlobalState";
import {ProcessManager} from "../core/processManager/ProcessManager";
import {Lifecycle} from "../core/lifecycle/Lifecycle";

/**
 * Represents an opened editor. It manages the panes, tabs, and documents within the editor.
 *
 * *Warning: This class will take up the whole UI space. If you want to integrate an editor into an existing UI,
 * consider using the {@link Editor} class instead.*
 *
 * @author Atzitz Amos
 * @date 11/2/2025
 * @since 1.0.0
 */
export class ShadowApp {
    public static isRunning = false;
    private static instance: ShadowApp;

    private readonly processManager: ProcessManager;

    private constructor() {
        this.processManager = new ProcessManager();
    }

    /**
     * Launch the ShadowApp. This is the single entry point for the application.
     * Initializes the UI (with progress bar), runs all startup phases via Lifecycle,
     * and resolves when the app is fully ready.
     *
     * @returns A promise that resolves to true if startup succeeded, false if aborted.
     */
    public static async launch(): Promise<boolean> {
        if (ShadowApp.isRunning) {
            throw new Error("Shadow app is already running");
        }

        // Create the app instance
        ShadowApp.instance = new ShadowApp();

        // Initialize GlobalState with the app
        GlobalState.init(ShadowApp.instance);

        // Launch the UI (this will display the progress bar)
        ShadowUI.launch(ShadowApp.instance);

        // Get the lifecycle instance (creates it if needed)
        const lifecycle = Lifecycle.getInstance();

        // Run all startup phases
        const success = await lifecycle.start(ShadowApp.instance);

        if (success) {
            ShadowApp.isRunning = true;
        }

        return success;
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

    getProcessManager(): ProcessManager {
        return this.processManager;
    }
}