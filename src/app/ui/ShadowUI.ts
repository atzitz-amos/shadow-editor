import {Taskbar} from "./taskbar/Taskbar";
import {ShadowApp} from "../ShadowApp";
import {EventBus} from "../../core/events/EventBus";
import {StartupProgressEvent} from "../../core/lifecycle/events/StartupProgressEvent";
import {StartupFailedEvent} from "../../core/lifecycle/events/StartupFailedEvent";
import {ShadowAppLoadedEvent} from "../events/ShadowAppLoadedEvent";

/**
 * Represents the main app UI
 *
 * @author Atzitz Amos
 * @date 11/6/2025
 * @since 1.0.0
 */
export class ShadowUI {
    private static instance: ShadowUI;

    private myApp: ShadowApp;

    private renderingProcess: any;

    private myTaskbar: Taskbar;

    // Splash screen elements
    private splashOverlay: HTMLElement | null = null;
    private progressBar: HTMLElement | null = null;
    private progressText: HTMLElement | null = null;
    private splashCreatedAt: number = 0;

    // Minimum time (ms) the splash screen should be visible
    private static readonly MIN_SPLASH_DURATION = 800;

    private constructor() {
        this.myTaskbar = new Taskbar();
    }

    public static launch(app: ShadowApp): void {
        if (ShadowUI.instance) {
            console.error("ShadowUI has already been launched!");
            return;
        }
        ShadowUI.getRunningInstance().launch(app);
    }

    public static getRunningInstance(): ShadowUI {
        if (!ShadowUI.instance) {
            this.instance = new ShadowUI();
        }
        return ShadowUI.instance;
    }

    private launch(app: ShadowApp) {
        this.renderingProcess = setInterval(this.eventLoop.bind(this));
        this.myApp = app;

        // Create and show the splash screen with progress bar
        this.createSplashScreen();

        // Subscribe to startup events
        const eventBus = EventBus.getMainEventBus();
        eventBus.subscribe(this, StartupProgressEvent.SUBSCRIBER, this.onStartupProgress.bind(this));
        eventBus.subscribe(this, StartupFailedEvent.SUBSCRIBER, this.onStartupFailed.bind(this));
        eventBus.subscribe(this, ShadowAppLoadedEvent.SUBSCRIBER, this.onAppLoaded.bind(this));
    }

    private createSplashScreen(): void {
        this.splashCreatedAt = Date.now();

        // Create overlay container
        this.splashOverlay = document.createElement('div');
        this.splashOverlay.className = 'shadow-splash-overlay';
        this.splashOverlay.innerHTML = `
            <div class="shadow-splash-content">
                <div class="shadow-splash-title">Shadow Editor</div>
                <div class="shadow-splash-progress-container">
                    <div class="shadow-splash-progress-bar"></div>
                </div>
                <div class="shadow-splash-progress-text">Initializing...</div>
            </div>
        `;

        document.body.appendChild(this.splashOverlay);

        // Get references to progress elements
        this.progressBar = this.splashOverlay.querySelector('.shadow-splash-progress-bar');
        this.progressText = this.splashOverlay.querySelector('.shadow-splash-progress-text');
    }

    private onStartupProgress(event: StartupProgressEvent): void {
        if (this.progressBar) {
            this.progressBar.style.width = `${event.getPercent()}%`;
        }
        if (this.progressText) {
            this.progressText.textContent = event.getPhaseName();
        }
    }

    private onStartupFailed(event: StartupFailedEvent): void {
        if (this.splashOverlay && event.wasAborted()) {
            // Transform splash screen into error screen
            const content = this.splashOverlay.querySelector('.shadow-splash-content');
            if (content) {
                // Hide progress bar
                const progressContainer = content.querySelector('.shadow-splash-progress-container');
                if (progressContainer) {
                    (progressContainer as HTMLElement).style.display = 'none';
                }

                // Update progress text to show error state
                if (this.progressText) {
                    this.progressText.textContent = 'Startup Failed';
                    this.progressText.style.color = '#ff6b6b';
                    this.progressText.style.fontSize = '18px';
                    this.progressText.style.marginBottom = '20px';
                }

                // Add error details
                const errorDiv = document.createElement('div');
                errorDiv.className = 'shadow-splash-error';
                errorDiv.innerHTML = `
                    <div class="shadow-splash-error-phase">Phase: ${event.getPhase().name}</div>
                    <div class="shadow-splash-error-message">${event.getError().message}</div>
                    <div class="shadow-splash-error-hint">Check the console for more details.</div>
                `;
                content.appendChild(errorDiv);
            }

            // Unsubscribe from further events since we're staying on error screen
            const eventBus = EventBus.getMainEventBus();
            eventBus.unsubscribe(this, StartupProgressEvent.SUBSCRIBER);
            eventBus.unsubscribe(this, ShadowAppLoadedEvent.SUBSCRIBER);
            // Keep StartupFailedEvent subscription in case of multiple failures
        }
    }

    private onAppLoaded(event: ShadowAppLoadedEvent): void {
        // Calculate how long the splash has been visible
        const elapsed = Date.now() - this.splashCreatedAt;
        const remainingTime = Math.max(0, ShadowUI.MIN_SPLASH_DURATION - elapsed);

        // Wait for minimum duration before hiding
        setTimeout(() => {
            this.hideSplashScreen();
        }, remainingTime);

        // Unsubscribe from startup events
        const eventBus = EventBus.getMainEventBus();
        eventBus.unsubscribe(this, StartupProgressEvent.SUBSCRIBER);
        eventBus.unsubscribe(this, StartupFailedEvent.SUBSCRIBER);
        eventBus.unsubscribe(this, ShadowAppLoadedEvent.SUBSCRIBER);
    }

    private hideSplashScreen(): void {
        if (this.splashOverlay) {
            this.splashOverlay.classList.add('fade-out');
            setTimeout(() => {
                this.splashOverlay?.remove();
                this.splashOverlay = null;
                this.progressBar = null;
                this.progressText = null;
            }, 300);
        }
    }

    private eventLoop() {

    }
}
