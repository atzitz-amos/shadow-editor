/**
 *
 * @author Atzitz Amos
 * @date 6/2/2026
 * @since 1.0.0
 */
export class KillSignalTriggeredError extends Error {
    constructor() {
        super("Kill signal triggered");
    }
}

export interface KillSignal {
    /**
     * Checks if the process should stop and throw a KillSignalTriggeredError if it should.
     */
    check(): void;
}

export class EmptyKillSignal implements KillSignal {
    public static readonly INSTANCE = new EmptyKillSignal();

    check(): void {
        // Do nothing
    }
}


export class TimeoutKillSignal implements KillSignal {
    private readonly timeout: number;
    private readonly startTime: number;

    constructor(timeout: number) {
        this.timeout = timeout;
        this.startTime = Date.now();
    }

    check(): void {
        if (Date.now() - this.startTime > this.timeout) {
            throw new KillSignalTriggeredError();
        }
    }
}