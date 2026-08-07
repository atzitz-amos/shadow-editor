import {HighlightEffect} from "./HighlightEffect";

export class FadeEffect implements HighlightEffect {
    private readonly delay: number;
    private readonly duration: number;
    private state: any = null;

    /**
     * @param duration Time in milliseconds for the fade transition to complete.
     * @param delay Time in milliseconds to wait before starting the fade.
     */
    constructor(duration: number = 1000, delay: number = 0) {
        this.duration = duration;
        this.delay = delay;
    }

    clone(): HighlightEffect {
        return new FadeEffect(this.duration, this.delay);
    }

    getState(): any {
        if (!this.state) {
            this.state = {startTime: null, initialOpacity: null, finished: false};
        }
        return this.state;
    }

    resume(state: any): void {
        this.state = state;
    }

    apply(element: HTMLElement): void {
        const state = this.getState();
        if (state.finished) {
            element.style.opacity = "0";
            return;
        }

        const startFade = () => {
            const currentOpacity = parseFloat(window.getComputedStyle(element).opacity) || 1;
            if (state.initialOpacity === null) {
                state.initialOpacity = currentOpacity;
            }

            const animate = (timestamp: number) => {
                if (state.startTime === null) state.startTime = timestamp;
                const linearProgress = Math.min((timestamp - state.startTime) / this.duration, 1);

                // Ease-out quadratic formula: starts fast, gently decelerates to 0 opacity
                const easedProgress = 1 - Math.pow(1 - linearProgress, 2);

                element.style.opacity = (state.initialOpacity * (1 - easedProgress)).toFixed(3);

                if (linearProgress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    state.finished = true;
                }
            };

            requestAnimationFrame(animate);
        };

        if (this.delay > 0) {
            window.setTimeout(startFade, this.delay);
        } else {
            startFade();
        }
    }
}
