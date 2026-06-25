import {Logger} from "../../logging/logger/LoggerCore";

/**
 *
 * @author Atzitz Amos
 * @date 6/16/2026
 * @since 1.0.0
 */
export class CustomElementsLoader {
    private static readonly logger: Logger = Logger.for("CustomElementsLoader");

    private static isLoaded = false;

    public static ensureLoaded() {
        if (this.isLoaded) {
            return;
        }
        this.isLoaded = true;

        const modules = import.meta.glob('./*/*.ts', {eager: true});

        Object.keys(modules).forEach(
            path => {
                this.logger.debug("Loading custom element from path: " + path);
            }
        )
    }
}
