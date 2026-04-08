import {LogStyles} from "./LoggerStyles";
import {LogLevel} from "./LoggerTypes";

export function extractFilename(source: string): string {
    try {
        const url = new URL(source);
        const pathname = url.pathname;
        return pathname.split("/").pop() || "Unknown";
    } catch {
        const parts = source.replace(/\\/g, "/").split("/");
        return parts.pop() || "Unknown";
    }
}

export function formatTimestamp(): string {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        fractionalSecondDigits: 3
    });
}

export function getConsoleMethod(level: LogLevel): "debug" | "info" | "log" | "error" {
    switch (level) {
        case LogLevel.DEBUG:
            return "debug";
        case LogLevel.INFO:
            return "info";
        case LogLevel.WARN:
            return "log";
        case LogLevel.ERROR:
            return "error";
        default:
            return "info";
    }
}

export function getLevelLabel(level: LogLevel): "debug" | "info" | "warn" | "error" {
    switch (level) {
        case LogLevel.DEBUG:
            return "debug";
        case LogLevel.INFO:
            return "info";
        case LogLevel.WARN:
            return "warn";
        case LogLevel.ERROR:
            return "error";
        default:
            return "info";
    }
}

export function getLevelStyle(level: LogLevel): string {
    switch (level) {
        case LogLevel.DEBUG:
            return LogStyles.level.debug;
        case LogLevel.INFO:
            return LogStyles.level.info;
        case LogLevel.WARN:
            return LogStyles.level.warn;
        case LogLevel.ERROR:
            return LogStyles.level.error;
        default:
            return LogStyles.level.info;
    }
}

