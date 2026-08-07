import {HighlightEffect} from "./HighlightEffect";

/**
 *
 * @author Atzitz Amos
 * @date 8/2/2026
 * @since 1.0.0
 */
export class BlinkEffect implements HighlightEffect {
    private readonly duration: number;
    private readonly interval: number;
    private state: any = null;

    constructor(interval: number, duration: number = Infinity) {
        this.interval = interval;
        this.duration = duration;
    }

    clone(): HighlightEffect {
        return new BlinkEffect(this.interval, this.duration);
    }

    getState(): any {
        if (!this.state) {
            this.state = {startTime: null, lastToggleTime: 0, finished: false};
        }
        return this.state;
    }

    resume(state: any): void {
        this.state = state;
    }

    apply(element: HTMLElement): void {
        const state = this.getState();

        if (state.finished) {
            return;
        }

        const blink = (timestamp: number) => {
            if (state.startTime === null) state.startTime = timestamp;
            const currentElapsed = timestamp - state.startTime;

            if (currentElapsed >= this.duration) {
                element.style.visibility = '';
                state.finished = true;
                return;
            }

            if (timestamp - state.lastToggleTime >= this.interval) {
                element.style.visibility = element.style.visibility === 'hidden' ? '' : 'hidden';
                state.lastToggleTime = timestamp;
            }

            requestAnimationFrame(blink);
        };

        requestAnimationFrame(blink);
    }
}
