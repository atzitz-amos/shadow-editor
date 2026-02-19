import {PluginManager} from "../PluginManager";
import {ExtensionPoint} from "./ExtensionPoint";
import {EditorPlugin} from "../loader/Plugin";
import {StyleManager} from "../../styles/StyleManager";
import {StyleExtensionPointSupplier} from "./StyleExtensionPointSupplier";
import {Logger, UseLogger} from "../../logging/Logger";

/**
 * Extension point for registering plugin CSS stylesheets.
 * Stylesheets are injected into the DOM when a plugin is enabled,
 * and removed when the plugin is disabled.
 *
 * @author Shadow Editor
 * @date 2/19/2026
 * @since 1.0.0
 */
@UseLogger("StyleExtensionPoint")
export class StyleExtensionPoint implements ExtensionPoint {
    private static readonly instance: StyleExtensionPoint = new StyleExtensionPoint();
    private declare readonly logger: Logger;

    /**
     * Tracks registered style IDs per plugin for clean unregistration.
     */
    private readonly pluginStyles: Record<string, string[]> = {};

    static get class(): ExtensionPoint {
        return StyleExtensionPoint.instance;
    }

    getName(): string {
        return "styles";
    }

    register(manager: PluginManager, owner: EditorPlugin, instance: any): void {
        const supplier = instance as StyleExtensionPointSupplier;
        const ownerName = owner.constructor.name;
        const styleManager = StyleManager.getInstance();

        if (!this.pluginStyles[ownerName]) {
            this.pluginStyles[ownerName] = [];
        }

        // Register external stylesheet URLs
        if (typeof supplier.getStylesheetUrls === "function") {
            const urls = supplier.getStylesheetUrls();
            for (let i = 0; i < urls.length; i++) {
                const id = `plugin-${ownerName}-css-${i}`;
                styleManager.registerStylesheet(id, urls[i]);
                this.pluginStyles[ownerName].push(id);
            }
        }

        // Register inline styles
        if (typeof supplier.getInlineStyles === "function") {
            const css = supplier.getInlineStyles();
            if (css) {
                const id = `plugin-${ownerName}-inline`;
                styleManager.registerInlineStyle(id, css);
                this.pluginStyles[ownerName].push(id);
            }
        }

        this.logger.debug(`Registered styles for plugin: ${ownerName}`);
    }

    unregister(manager: PluginManager, owner: EditorPlugin): void {
        const ownerName = owner.constructor.name;
        const styleManager = StyleManager.getInstance();
        const styleIds = this.pluginStyles[ownerName];

        if (styleIds) {
            for (const id of styleIds) {
                styleManager.unregisterStylesheet(id);
            }
            delete this.pluginStyles[ownerName];
            this.logger.debug(`Unregistered all styles for plugin: ${ownerName}`);
        }
    }
}

