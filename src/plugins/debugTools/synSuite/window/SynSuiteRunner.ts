import {SynSuiteEngine} from "../../../../app/testLib/lang/suite/SynSuiteEngine";
import {SynSuiteTest} from "../../../../app/testLib/lang/suite/SynSuiteTest";
import {Scheduler} from "../../../../core/scheduler/Scheduler";
import {SynSuiteDisplayStatus} from "./SynSuiteStatus";

export type SynSuiteRunSummary = {
    finishedAt: number,
    count: number,
    /** Sum of the timings of the tests, in milliseconds */
    duration: number
}

/**
 * Runs tests through the {@link SynSuiteEngine} one at a time, keeping track of the queue so that the window
 * can show which test is running and which ones are waiting.
 *
 * @author Atzitz Amos
 * @date 10/23/2026
 * @since 1.0.0
 */
export class SynSuiteRunner {
    private queue: string[] = [];
    private total: number = 0;
    private lastRun: SynSuiteRunSummary | null = null;
    private readonly listeners: (() => void)[] = [];

    private get engine(): SynSuiteEngine {
        return SynSuiteEngine.getInstance();
    }

    onChange(listener: () => void): void {
        this.listeners.push(listener);
    }

    dispose(): void {
        this.listeners.length = 0;
    }

    isRunning(): boolean {
        return this.queue.length > 0;
    }

    /** Between 0 and 1 while running */
    getProgress(): number {
        return this.total === 0 ? 0 : (this.total - this.queue.length) / this.total;
    }

    getLastRun(): SynSuiteRunSummary | null {
        return this.lastRun;
    }

    statusOf(test: SynSuiteTest): SynSuiteDisplayStatus {
        if (this.queue[0] === test.id) return "running";
        if (this.queue.includes(test.id)) return "queued";
        return this.engine.getLastResult(test.id)?.getStatus() ?? "idle";
    }

    /**
     * Runs the tests, unless a run is already in progress.
     */
    async run(tests: SynSuiteTest[]): Promise<void> {
        if (this.isRunning() || tests.length === 0) return;

        this.queue = tests.map(test => test.id);
        this.total = tests.length;
        this.emit();
        // Let the window paint the queue and the progress before the first test runs
        await Scheduler.nextFrame();

        const results = await this.engine.runTests(tests, () => {
            this.queue.shift();
            if (this.queue.length > 0) this.emit();
        });

        this.queue = [];
        this.lastRun = {
            finishedAt: Date.now(),
            count: results.length,
            duration: results.reduce((sum, result) => sum + result.getTotalTime(), 0)
        };
        this.emit();
    }

    private emit() {
        this.listeners.forEach(listener => listener());
    }
}
