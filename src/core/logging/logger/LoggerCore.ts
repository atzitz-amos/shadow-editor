import {LogStyles} from "./LoggerStyles";
import {LogLevel, LoggerConfig} from "./LoggerTypes";
import {configureLogger, getLoggerConfig, setLoggerLevel} from "./LoggerState";
import {formatTimestamp, getConsoleMethod, getLevelLabel, getLevelStyle} from "./LoggerUtils";

export class Logger {
    private readonly source: string;

    private constructor(source: string) {
        this.source = source;
    }

    static for(source: string): Logger {
        return new Logger(source);
    }

    static configure(config: Partial<LoggerConfig>): void {
        configureLogger(config);
    }

    static getConfig(): Readonly<LoggerConfig> {
        return getLoggerConfig();
    }

    static setLevel(level: LogLevel): void {
        setLoggerLevel(level);
    }

    debug(message: string, ...data: unknown[]): void {
        this.log(LogLevel.DEBUG, message, data);
    }

    info(message: string, ...data: unknown[]): void {
        this.log(LogLevel.INFO, message, data);
    }

    warn(message: string, ...data: unknown[]): void {
        this.log(LogLevel.WARN, message, data);
    }

    error(message: string, ...data: unknown[]): void {
        this.log(LogLevel.ERROR, message, data);
    }

    private log(level: LogLevel, message: string, data: unknown[]): void {
        const config = getLoggerConfig();
        if (level < config.minLevel) {
            return;
        }

        const consoleMethod = getConsoleMethod(level);
        const levelLabel = getLevelLabel(level);
        const levelStyle = getLevelStyle(level);
        const styleKey = getLevelLabel(level) as "debug" | "info" | "warn" | "error";

        const styles: string[] = [];
        let formatString = `%c[${levelLabel}]`;
        styles.push(levelStyle);

        formatString += ` %c[${this.source}]`;
        styles.push(LogStyles.source[styleKey]);

        formatString += " ";

        const messageStyle = LogStyles.message[styleKey];
        const tokens = message.split(/(\s+|(?<=[^\s])-(?=[^\s])|(?<=:)|(?<=\/)|(?<=\\\\)|(?<=\.))/g).filter(w => w);
        for (const token of tokens) {
            if (/^\s+$/.test(token)) {
                formatString += token;
            } else {
                formatString += `%c${token}`;
                styles.push(messageStyle);
            }
        }

        if (config.showTimestamp) {
            formatString += ` %c${formatTimestamp()}`;
            styles.push(LogStyles.timestamp[styleKey]);
        }

        if (data.length > 0) {
            console[consoleMethod](formatString, ...styles, ...data);
        } else {
            console[consoleMethod](formatString, ...styles);
        }
    }
}

