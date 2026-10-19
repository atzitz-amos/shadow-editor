import {ExtensionPointSupplier} from "./ExtensionPointSupplier";

const EXT_POINT = Symbol.for("editor.extensionPoint");

type KnownExtensionPoint =
    | "lang"
    | "lang/definitions"
    | "intents"
    | "annotators"
    | "inspections"
    | "actions"
    | "smart"
    | "tokenhover"
    | "panes"
    | "settings/pane"
    | "projectFiles"
    | "startupPhase"
    | "codeAnalysis/pass";

/**
 * Declares which extension point a supplier contributes to.
 * The file can live anywhere under /src/plugins/{pluginName}/.
 *
 * @example
 * @Extension("toolbar.items")
 * export default class BoldItem implements ExtensionPointSupplier { ... }
 */
export function Extension(point: KnownExtensionPoint | string) {
    // Second parameter keeps this compatible with both legacy and standard decorators.
    return (cls: Constructor<ExtensionPointSupplier>, _context?: unknown): void => {
        Object.defineProperty(cls, EXT_POINT, {
            value: point,
            enumerable: false,
            configurable: false,
            writable: false,
        });
    };
}

/**
 * Returns the extension point a class was decorated with, or undefined.
 * Only reads the class's own property, so subclasses of a decorated class
 * must declare their own @Extension.
 */
export function getExtensionPoint(cls: unknown): string | undefined {
    if (typeof cls !== "function") return undefined;
    return Object.prototype.hasOwnProperty.call(cls, EXT_POINT)
        ? (cls as any)[EXT_POINT]
        : undefined;
}