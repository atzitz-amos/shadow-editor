import {Logger, UseLogger} from "../logging/Logger";

/**
 * Manages runtime CSS stylesheet injection and removal.
 * Plugins and core components can register/unregister stylesheets dynamically.
 *
 * Each stylesheet is tracked by a unique ID to prevent duplicates and allow clean removal.
 *
 * @author Atzitz Amos
 * @date 2/19/2026
 * @since 1.0.0
 */
@UseLogger("StyleManager")
export class StyleManager {
    private static _instance: StyleManager;
    private declare readonly logger: Logger;

    /**
     * Map of stylesheet ID -> HTMLLinkElement or HTMLStyleElement
     */
    private readonly styles: Map<string, HTMLLinkElement | HTMLStyleElement> = new Map();

    static getInstance(): StyleManager {
        if (!this._instance) {
            this._instance = new StyleManager();
        }
        return this._instance;
    }

    /**
     * Register an external CSS file by URL.
     * Injects a <link> element into the document head.
     *
     * @param id Unique identifier for this stylesheet
     * @param url The URL of the CSS file to load
     * @returns A promise that resolves when the stylesheet is loaded
     */
    registerStylesheet(id: string, url: string): Promise<void> {
        if (this.styles.has(id)) {
            this.logger.warn(`Stylesheet "${id}" is already registered. Skipping.`);
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = url;
            link.dataset.styleId = id;

            link.onload = () => {
                this.logger.debug(`Stylesheet "${id}" loaded from: ${url}`);
                resolve();
            };
            link.onerror = () => {
                this.logger.error(`Failed to load stylesheet "${id}" from: ${url}`);
                this.styles.delete(id);
                reject(new Error(`Failed to load stylesheet: ${url}`));
            };

            this.styles.set(id, link);
            document.head.appendChild(link);
        });
    }

    /**
     * Register inline CSS content.
     * Injects a <style> element into the document head.
     *
     * @param id Unique identifier for this stylesheet
     * @param css The CSS string content
     */
    registerInlineStyle(id: string, css: string): void {
        if (this.styles.has(id)) {
            this.logger.warn(`Stylesheet "${id}" is already registered. Skipping.`);
            return;
        }

        const style = document.createElement("style");
        style.dataset.styleId = id;
        style.textContent = css;

        this.styles.set(id, style);
        document.head.appendChild(style);

        this.logger.debug(`Inline stylesheet "${id}" injected.`);
    }

    /**
     * Unregister and remove a stylesheet from the document.
     *
     * @param id The unique identifier of the stylesheet to remove
     * @returns true if the stylesheet was found and removed, false otherwise
     */
    unregisterStylesheet(id: string): boolean {
        const element = this.styles.get(id);
        if (!element) {
            this.logger.debug(`Stylesheet "${id}" not found for removal.`);
            return false;
        }

        element.remove();
        this.styles.delete(id);
        this.logger.debug(`Stylesheet "${id}" unregistered and removed.`);
        return true;
    }

    /**
     * Check whether a stylesheet with the given ID is currently registered.
     */
    hasStylesheet(id: string): boolean {
        return this.styles.has(id);
    }

    /**
     * Unregister all stylesheets matching a prefix.
     * Useful for removing all styles owned by a specific plugin.
     *
     * @param prefix The prefix to match against stylesheet IDs
     */
    unregisterByPrefix(prefix: string): void {
        for (const [id, element] of this.styles) {
            if (id.startsWith(prefix)) {
                element.remove();
                this.styles.delete(id);
                this.logger.debug(`Stylesheet "${id}" unregistered (prefix: "${prefix}").`);
            }
        }
    }
}

