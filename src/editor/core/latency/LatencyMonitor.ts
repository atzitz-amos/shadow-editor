import {Service, ServiceImpl} from "../../../core/threaded/service/Service";
import {GlobalState} from "../../../core/global/GlobalState";
import {KeyPressedEvent} from "../../impl/events/PhysicalEvents";
import {LatencyUpdatedEvent} from "./LatencyUpdatedEvent";

@Service
export class LatencyMonitor implements ServiceImpl {
    private static instance: LatencyMonitor;

    static getInstance(): LatencyMonitor {
        if (!LatencyMonitor.instance) {
            LatencyMonitor.instance = new LatencyMonitor();
        }
        return LatencyMonitor.instance;
    }

    private readonly publishIntervalMs = 1000;
    private publishTimer: ReturnType<typeof setInterval> | null = null;

    /** Worst delta seen since the last publish tick. Reset every tick. */
    private windowMax = 0;

    /** Decaying value actually shown to the user. */
    private displayPeak = 0;

    /** Fraction of the current displayed peak retained each publish tick.
     *  0.6 ≈ peak fades to ~10% of its value after ~5 ticks (~5s). Lower
     *  = faster fade, higher = spikes linger longer. */
    private readonly peakDecayPerTick = 0.6;

    /** A single frame this far over budget is surfaced immediately
     *  instead of waiting for the next publish tick, so a one-off
     *  freeze isn't hidden behind up to a second of delay. */
    private readonly instantSpikeThresholdMs = 50;

    private rafRunning = false;
    private lastFrameTime = 0;

    /** Any single delta above this is treated as a backgrounded-tab
     *  artifact (rAF paused/throttled while hidden) rather than real
     *  jank, and is discarded instead of recorded. The visibilitychange
     *  listener below is the primary defense; this is a backup in case
     *  visibility timing is ever slightly off in some browser. */
    private readonly maxPlausibleFrameMs = 1000;

    public begin() {
        this.publishTimer = setInterval(() => this.tick(), this.publishIntervalMs);
        this.startFrameLoop();

        document.addEventListener("visibilitychange", () => this.onVisibilityChange());
    }

    private onVisibilityChange(): void {
        if (document.visibilityState === "visible") {
            // Don't measure the gap while we were backgrounded — it's
            // not jank, just the tab being suspended. Reset the clock
            // so the next frame's delta is measured from "now".
            this.lastFrameTime = performance.now();
        }
    }

    private startFrameLoop(): void {
        this.rafRunning = true;
        this.lastFrameTime = performance.now();

        const isRunning = () => this.rafRunning;

        requestAnimationFrame(function tick(this: LatencyMonitor, time: number) {
            const delta = time - this.lastFrameTime;
            this.lastFrameTime = time;

            if (delta <= this.maxPlausibleFrameMs) {
                this.recordSample(delta);
            }

            if (isRunning()) requestAnimationFrame(tick.bind(this));
        }.bind(this));
    }

    /**
     * Feed a raw duration sample, in ms. Public so other sources
     * (e.g. timing a specific hot path) can also contribute.
     */
    recordSample(latencyMs: number): void {
        if (latencyMs > this.windowMax) {
            this.windowMax = latencyMs;
        }

        if (latencyMs > this.instantSpikeThresholdMs && latencyMs > this.displayPeak) {
            this.displayPeak = latencyMs;
            this.publishNow();
        }
    }

    /** Runs once per publishIntervalMs: folds the window's worst sample
     *  into the decaying display peak, then republishes. */
    private tick(): void {
        this.displayPeak = Math.max(this.windowMax, this.displayPeak * this.peakDecayPerTick);
        this.windowMax = 0;
        this.publishNow();
    }

    private publishNow(): void {
        GlobalState.getMainEventBus().asyncPublish(
            new LatencyUpdatedEvent(this.displayPeak)
        );
    }

    /** Stop the frame loop + publish interval — call on teardown. */
    dispose(): void {
        this.rafRunning = false;

        if (this.publishTimer !== null) {
            clearInterval(this.publishTimer);
            this.publishTimer = null;
        }
    }
}
