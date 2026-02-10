/**
 * Log levels supported by the Logger
 */
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    NONE = 4
}

/**
 * Configuration options for the Logger
 */
export interface LoggerConfig {
    minLevel: LogLevel;
    showTimestamp: boolean;
}

/**
 * Extract filename from a path or import.meta.url
 */
function extractFilename(source: string): string {
    try {
        const url = new URL(source);
        const pathname = url.pathname;
        return pathname.split('/').pop() || 'Unknown';
    } catch {
        // Fallback for non-URL strings (regular paths)
        const parts = source.replace(/\\/g, '/').split('/');
        return parts.pop() || 'Unknown';
    }
}

/**
 * Class decorator that automatically provides a Logger instance to every class instance.
 * The class must have declare a private property `logger` of type Logger.
 *
 * @param name The source name (filename or import.meta.url)
 *
 * @example
 * ```typescript
 * @UseLogger(import.meta.url)
 * class MyService {
 *     private declare readonly logger: Logger;
 *
 *     doSomething() {
 *         this.logger.info('Hello!'); // [info] [MyService.ts] Hello! 14:32:45.123
 *     }
 * }
 * ```
 */
export function UseLogger(name: string) {
    const filename = name.includes('/') || name.includes('\\')
        ? extractFilename(name)
        : name;
    const loggerInstance = Logger.for(filename);

    return function <T extends new (...args: any[]) => object>(constructor: T) {
        Object.defineProperty(constructor.prototype, 'logger', {
            get() {
                return loggerInstance;
            },
            enumerable: true,
            configurable: true
        });
        return constructor;
    };
}

/**
 * CSS styles for different log components
 */
const LogStyles = {
    level: {
        debug: 'color: #ababab; font-weight: bold;',
        info: 'color: #69b8ff; font-weight: bold;',
        warn: 'color: #FF9800; font-weight: bold;',
        error: 'color: #F44336; font-weight: bold;'
    },
    source: {
        debug: 'color: #9a8a9c; font-weight: normal;',
        info: 'color: #e29ee8; font-weight: normal;',
        warn: 'color: #e29ee8; font-weight: normal;',
        error: 'color: #e29ee8; font-weight: normal;'
    },
    message: {
        debug: 'color: #888; display: inline;',
        info: 'color: inherit; display: inline;',
        warn: 'color: #ffeca8;',
        error: 'color: inherit; display: inline;'
    },
    timestamp: {
        debug: 'color: #555; font-size: 0.85em; margin-left: 8px; font-family: monospace;',
        info: 'color: #666; font-size: 0.85em; margin-left: 8px; font-family: monospace;',
        warn: 'color: #666; font-size: 0.85em; margin-left: 8px; font-family: monospace;',
        error: 'color: #666; font-size: 0.85em; margin-left: 8px; font-family: monospace;'
    }
} as const;

/**
 * Global logger configuration
 */
let globalConfig: LoggerConfig = {
    minLevel: LogLevel.DEBUG,
    showTimestamp: true
};

/**
 * Format timestamp for display
 */
function formatTimestamp(): string {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3
    });
}

/**
 * Get the appropriate console method for a log level
 */
function getConsoleMethod(level: LogLevel): 'debug' | 'info' | 'log' | 'error' {
    switch (level) {
        case LogLevel.DEBUG:
            return 'debug';
        case LogLevel.INFO:
            return 'info';
        case LogLevel.WARN:
            return 'log';
        case LogLevel.ERROR:
            return 'error';
        default:
            return 'info';
    }
}

/**
 * Get the level label for display
 */
function getLevelLabel(level: LogLevel): string {
    switch (level) {
        case LogLevel.DEBUG:
            return 'debug';
        case LogLevel.INFO:
            return 'info';
        case LogLevel.WARN:
            return 'warn';
        case LogLevel.ERROR:
            return 'error';
        default:
            return 'info';
    }
}

/**
 * Get the style for a log level
 */
function getLevelStyle(level: LogLevel): string {
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

/**
 * A clean, styled Logger for web applications.
 *
 * @example
 * ```typescript
 * // Create a logger for a specific file/module
 * const logger = Logger.for('CoreService.ts');
 *
 * // Log messages at different levels
 * logger.info('Service initialized');
 * logger.debug('Processing data', { count: 42 });
 * logger.warn('Cache miss');
 * logger.error('Failed to connect', error);
 * ```
 */
export class Logger {
    private readonly source: string;

    private constructor(source: string) {
        this.source = source;
    }

    /**
     * Create a logger instance for a specific source file or module
     * @param source The source identifier (e.g., 'CoreService.ts')
     */
    static for(source: string): Logger {
        return new Logger(source);
    }

    /**
     * Configure the global logger settings
     * @param config Partial configuration to apply
     */
    static configure(config: Partial<LoggerConfig>): void {
        globalConfig = {...globalConfig, ...config};
    }

    /**
     * Get the current global configuration
     */
    static getConfig(): Readonly<LoggerConfig> {
        return {...globalConfig};
    }

    /**
     * Set the minimum log level globally
     */
    static setLevel(level: LogLevel): void {
        globalConfig.minLevel = level;
    }

    /**
     * Log a debug message
     */
    debug(message: string, ...data: unknown[]): void {
        this.log(LogLevel.DEBUG, message, data);
    }

    /**
     * Log an info message
     */
    info(message: string, ...data: unknown[]): void {
        this.log(LogLevel.INFO, message, data);
    }

    /**
     * Log a warning message
     */
    warn(message: string, ...data: unknown[]): void {
        this.log(LogLevel.WARN, message, data);
    }

    /**
     * Log an error message
     */
    error(message: string, ...data: unknown[]): void {
        this.log(LogLevel.ERROR, message, data);
    }

    /**
     * Internal log method that formats and outputs the message
     */
    private log(level: LogLevel, message: string, data: unknown[]): void {
        if (level < globalConfig.minLevel) {
            return;
        }

        const consoleMethod = getConsoleMethod(level);
        const levelLabel = getLevelLabel(level);
        const levelStyle = getLevelStyle(level);
        const styleKey = getLevelLabel(level) as 'debug' | 'info' | 'warn' | 'error';

        // Build the format string and styles array
        const styles: string[] = [];

        // Build format string: [level] [source] message timestamp
        let formatString = `%c[${levelLabel}]`;
        styles.push(levelStyle);

        formatString += ` %c[${this.source}]`;
        styles.push(LogStyles.source[styleKey]);

        // Add space between source and message
        formatString += ' ';

        // Split message into words and style each independently for natural wrapping
        // Split on spaces and keep common word-breaking characters as separate tokens
        const messageStyle = LogStyles.message[styleKey];
        const tokens = message.split(/(\s+|(?<=[^\s])-(?=[^\s])|(?<=:)|(?<=\/)|(?<=\\)|(?<=\.))/g).filter(w => w);
        for (const token of tokens) {
            if (/^\s+$/.test(token)) {
                // Whitespace token - add it without styling
                formatString += token;
            } else {
                // Word token - add with styling
                formatString += `%c${token}`;
                styles.push(messageStyle);
            }
        }

        // timestamp (if enabled)
        if (globalConfig.showTimestamp) {
            formatString += ` %c${formatTimestamp()}`;
            styles.push(LogStyles.timestamp[styleKey]);
        }


        // Output to console
        if (data.length > 0) {
            console[consoleMethod](formatString, ...styles, ...data);
        } else {
            console[consoleMethod](formatString, ...styles);
        }
    }
}
