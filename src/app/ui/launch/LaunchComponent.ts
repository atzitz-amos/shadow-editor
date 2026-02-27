import {ShadowAppLoadedEvent} from "../../events/ShadowAppLoadedEvent";
import {EventBus} from "../../../core/events/EventBus";
import {StartupProgressEvent} from "../../../core/lifecycle/events/StartupProgressEvent";
import {StartupFailedEvent} from "../../../core/lifecycle/events/StartupFailedEvent";
import {CriticalErrorRenderer} from "../../../core/critical/renderer/CriticalErrorRenderer";
import {ShadowUI} from "../ShadowUI";

/**
 *
 * @author Atzitz Amos
 * @date 2/20/2026
 * @since 1.0.0
 */
export class LaunchComponent {
    // Minimum time (ms) the splash screen should be visible
    private static readonly MIN_SPLASH_DURATION = 800;

    // Splash screen elements
    private splashOverlay: HTMLElement | null = null;
    private progressBar: HTMLElement | null = null;
    private progressText: HTMLElement | null = null;
    private splashCreatedAt: number = 0;

    constructor(private ui: ShadowUI) {
    }

    public static showSplashScreen(ui: ShadowUI) {
        new LaunchComponent(ui).display();
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

                // Delegate error rendering to CriticalErrorRenderer
                CriticalErrorRenderer.renderStartupError(content, event.getPhase(), event.getError());
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
        const remainingTime = Math.max(0, LaunchComponent.MIN_SPLASH_DURATION - elapsed);

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

    private display() {
        // Create and show the splash screen with progress bar
        this.createSplashScreen();

        // Subscribe to startup events
        const eventBus = EventBus.getMainEventBus();
        eventBus.subscribe(this, StartupProgressEvent.SUBSCRIBER, this.onStartupProgress.bind(this));
        eventBus.subscribe(this, StartupFailedEvent.SUBSCRIBER, this.onStartupFailed.bind(this));
        eventBus.subscribe(this, ShadowAppLoadedEvent.SUBSCRIBER, this.onAppLoaded.bind(this));
    }
}
