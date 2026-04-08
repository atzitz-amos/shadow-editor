import {Logger} from "./LoggerCore";
import {extractFilename} from "./LoggerUtils";

export function UseLogger(name: string) {
    const filename = name.includes("/") || name.includes("\\")
        ? extractFilename(name)
        : name;
    const loggerInstance = Logger.for(filename);

    return function <T extends new (...args: any[]) => object>(constructor: T) {
        Object.defineProperty(constructor.prototype, "logger", {
            get() {
                return loggerInstance;
            },
            enumerable: true,
            configurable: true
        });
        return constructor;
    };
}

