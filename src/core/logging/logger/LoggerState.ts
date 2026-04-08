import {LogLevel, LoggerConfig} from "./LoggerTypes";

let globalConfig: LoggerConfig = {
    minLevel: LogLevel.DEBUG,
    showTimestamp: true
};

export function configureLogger(config: Partial<LoggerConfig>): void {
    globalConfig = {...globalConfig, ...config};
}

export function getLoggerConfig(): Readonly<LoggerConfig> {
    return {...globalConfig};
}

export function setLoggerLevel(level: LogLevel): void {
    globalConfig.minLevel = level;
}

