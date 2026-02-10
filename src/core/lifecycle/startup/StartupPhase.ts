/**
 * Represents a phase in the application startup sequence.
 * Phases are executed in order of priority (lower priority runs first).
 *
 * @author Atzitz Amos
 * @date 2/3/2026
 * @since 1.0.0
 */
export interface StartupPhase {
    /**
     * Display name for this phase (shown in progress UI)
     */
    readonly name: string;

    /**
     * Priority determines execution order. Lower values run first.
     * Recommended ranges:
     * - 0-19: Core infrastructure (plugins)
     * - 20-39: Data recovery (persistence)
     * - 40-59: Service initialization
     * - 60-79: UI preparation
     * - 80-99: Final setup
     * - 100+: Post-startup
     */
    readonly priority: number;

    /**
     * If true, startup will abort if this phase fails.
     * If false, errors are logged but startup continues.
     * @default true
     */
    readonly critical?: boolean;

    /**
     * Execute this phase's initialization logic.
     * @returns A promise that resolves when the phase is complete.
     */
    run(): Promise<void>;
}

/**
 * Abstract base class for startup phases with sensible defaults.
 */
export abstract class AbstractStartupPhase implements StartupPhase {
    abstract readonly name: string;
    abstract readonly priority: number;
    readonly critical: boolean = true;

    abstract run(): Promise<void>;
}

