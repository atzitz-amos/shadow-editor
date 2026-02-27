import {StackTraceParser} from "../StackTraceParser";
import {StartupPhase} from "../../lifecycle/startup/StartupPhase";

/**
 * Renders critical error information into a DOM container or as a standalone overlay.
 * Used by the splash screen to display startup failures and by the @Critical decorator
 * to display uncaught exceptions from annotated methods.
 *
 * @author Atzitz Amos
 * @date 2/19/2026
 * @since 1.0.0
 */
export class CriticalErrorRenderer {

    /**
     * Show a full-screen error overlay, similar to the splash screen error state.
     * Used by the @Critical decorator when an exception is thrown outside of startup.
     *
     * @param source A label describing where the error originated (e.g. "MyClass.myMethod")
     * @param error The error that was thrown
     */
    static showOverlay(source: string, error: Error): void {
        const overlay = document.createElement('div');
        overlay.className = 'shadow-splash-overlay';
        overlay.innerHTML = `
            <div class="shadow-splash-content">
                <div class="shadow-splash-title">Shadow Editor</div>
                <div class="shadow-splash-progress-text" style="color: #ff6b6b; font-size: 18px; margin-bottom: 20px;">Critical Error</div>
            </div>
        `;
        document.body.appendChild(overlay);

        const content = overlay.querySelector('.shadow-splash-content')!;
        CriticalErrorRenderer.renderError(content, source, error);
    }

    /**
     * Render a critical error into the given container element.
     * Used by the splash screen during startup failures.
     *
     * @param container The parent element to append the error display to
     * @param phase The startup phase that failed
     * @param error The error that was thrown
     */
    static renderStartupError(container: Element, phase: StartupPhase, error: Error): void {
        CriticalErrorRenderer.renderError(container, phase.name, error);
    }

    /**
     * Core rendering logic shared by both the startup splash and standalone overlay.
     *
     * @param container The parent element to append the error display to
     * @param source A label describing the error source (phase name, method name, etc.)
     * @param error The error that was thrown
     */
    private static renderError(container: Element, source: string, error: Error): void {
        const stack = error.stack || '';
        const frameLines = StackTraceParser.extractFrameLines(stack);
        const firstFrame = frameLines.length > 0 ? StackTraceParser.parseFrame(frameLines[0]) : null;

        // Format location summary
        const locationHtml = firstFrame
            ? `<div class="shadow-splash-error-location">at <a href="${firstFrame.url}" class="shadow-splash-error-link">${firstFrame.label}</a></div>`
            : '';

        // Format full traceback with links
        const formattedStack = frameLines.map(line => {
            const frame = StackTraceParser.parseFrame(line);
            if (frame) {
                return `at ${frame.fn}<a href="${frame.url}" class="shadow-splash-error-link">${frame.label}</a>`;
            }
            return line.trim();
        }).join('\n');

        const errorDiv = document.createElement('div');
        errorDiv.className = 'shadow-splash-error';
        errorDiv.innerHTML = `
            <div class="shadow-splash-error-phase">Source: ${source}</div>
            <div class="shadow-splash-error-message">${error.message}</div>
            ${locationHtml}
            ${formattedStack ? `
            <details class="shadow-splash-error-details">
                <summary>Show traceback</summary>
                <div class="shadow-splash-error-stack">${formattedStack}</div>
            </details>` : ''}
            <div class="shadow-splash-error-hint">Check the console for more details.</div>
        `;
        container.appendChild(errorDiv);
    }
}

