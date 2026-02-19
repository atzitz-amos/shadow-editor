import {ExtensionPointSupplier} from "./ExtensionPointSupplier";

/**
 * Supplier interface for the styles extension point.
 * Plugins should implement this to provide CSS stylesheets.
 *
 * The plugin loader discovers these under the `styles/` directory of each plugin,
 * e.g., `/src/plugins/myPlugin/styles/MyStyles.ts`.
 *
 * @author Shadow Editor
 * @date 2/19/2026
 * @since 1.0.0
 */
export interface StyleExtensionPointSupplier extends ExtensionPointSupplier {
    /**
     * Return the URL(s) of CSS files to register.
     * URLs are relative to the project root (e.g., "src/plugins/myPlugin/styles/myPlugin.css").
     */
    getStylesheetUrls(): string[];

    /**
     * Optional: return inline CSS content to inject.
     * Use this for small, dynamic styles that don't need a separate file.
     */
    getInlineStyles?(): string;
}

