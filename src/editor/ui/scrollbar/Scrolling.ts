import {View} from "../view/View";
import {Document} from "../../core/document/Document";

export class Scrolling {
    private static readonly scrollListeners: ((doc: Document, x: number, y: number) => void)[] = [];

    // Eased scroll-to state — used ONLY for discrete jumps (caret follow, goto-line).
    scrollX: number;
    scrollY: number;
    // Wheel/trackpad input never touches this — it's applied instantly, like every editor does.
    private animStartX: number = 0;
    private animStartY: number = 0;
    private animEndX: number = 0;
    private animEndY: number = 0;
    private animStartTime: number = 0;
    private animDuration: number = 0;
    private animRafHandle: number | null = null;
    private readonly MAX_DELTA = 120; // clamp a single wheel event's contribution
    private readonly MAX_DURATION_MS = 100;

    private readonly view: View;

    constructor(view: View, scrollX: number, scrollY: number) {
        this.view = view;
        this.scrollX = scrollX;
        this.scrollY = scrollY;
    }

    get scrollYLines(): number {
        return Math.ceil(this.scrollY / this.view.getLineHeight());
    }

    set scrollYLines(lines: number) {
        this.scrollY = lines * this.view.getLineHeight();
    }

    get scrollXChars(): number {
        return Math.ceil(this.scrollX / this.view.getCharSize());
    }

    set scrollXChars(chars: number) {
        this.scrollX = chars * this.view.getCharSize();
    }

    get scrollYOffset(): number {
        return this.scrollY % this.view.getLineHeight();
    }

    get scrollXOffset(): number {
        return this.scrollX % this.view.getCharSize();
    }

    public static addScrollListener(listener: (doc: Document, x: number, y: number) => void) {
        this.scrollListeners.push(listener);
    }

    public static removeScrollListener(listener: (doc: Document, x: number, y: number) => void) {
        const index = this.scrollListeners.indexOf(listener);
        if (index !== -1) {
            this.scrollListeners.splice(index, 1);
        }
    }

    /**
     * Applies a wheel delta immediately — no animation. Matches how every real
     * editor (including IntelliJ, see ScrollingModelImpl#scroll) handles wheel input:
     * animation is reserved only for discrete jumps like scrollTo, never continuous input.
     */
    scrollBy(deltaX: number, deltaY: number) {
        this.cancelAnimation(); // a fresh wheel event always overrides a pending caret-follow jump

        const [dx, dy] = this.normalizeWheelDelta(deltaX, deltaY);

        this.scrollX = this.clampX(this.scrollX + dx);
        this.scrollY = this.clampY(this.scrollY + dy);

        Scrolling.scrollListeners.forEach(l => l(this.view.getEditor().getOpenedDocument(), this.scrollX, this.scrollY));

        this.view.triggerRepaint();
    }

    /**
     * Sets an explicit scroll target (in pixels). In Smooth mode, animates toward it
     * with a short distance-scaled tween (like IntelliJ's AnimatedScrollingRunnable);
     * in Instant mode, snaps immediately. Only ever called once per logical jump
     * (e.g. ensureCaretVisible) — never per wheel tick — so the ease-out curve never restarts mid-flight.
     */
    scrollTo(x: number, y: number, mode: ScrollMode) {
        const targetX = this.clampX(x);
        const targetY = this.clampY(y);

        if (mode === ScrollMode.Instant) {
            this.cancelAnimation();
            this.scrollX = targetX;
            this.scrollY = targetY;
            this.view.triggerRepaint();
        } else {
            this.startAnimation(targetX, targetY);
        }

        Scrolling.scrollListeners.forEach(l => l(this.view.getEditor().getOpenedDocument(), x, y));
    }

    private clampX(x: number): number {
        const maxX = Math.max(0, (this.view.getEditor().getOpenedDocument().getMaxLengthLine() - this.view.getVisualCharCount() + 2) * this.view.getCharSize());
        return Math.min(Math.max(0, x), maxX);
    }

    private clampY(y: number): number {
        const maxY = Math.max(0, (this.view.getEditor().getLineCount() - this.view.getVisualLineCount() + 2) * this.view.getLineHeight());
        return Math.min(Math.max(0, y), maxY);
    }

    private normalizeWheelDelta(deltaX: number, deltaY: number): [number, number] {
        return [
            Math.max(-this.MAX_DELTA, Math.min(this.MAX_DELTA, deltaX / 2)),
            Math.max(-this.MAX_DELTA, Math.min(this.MAX_DELTA, deltaY)),
        ];
    }

    // --- Distance-scaled tween, for discrete jumps only ---

    private startAnimation(targetX: number, targetY: number) {
        const distX = targetX - this.scrollX;
        const distY = targetY - this.scrollY;

        this.animStartX = this.scrollX;
        this.animStartY = this.scrollY;
        this.animEndX = targetX;
        this.animEndY = targetY;
        this.animStartTime = performance.now();
        this.animDuration = this.computeDuration(Math.hypot(distX, distY));

        this.requestAnimFrame();
    }

    private computeDuration(distance: number): number {
        const lineHeight = this.view.getLineHeight();
        const lineDist = distance / lineHeight;
        const part = Math.min(1, Math.max(0, (lineDist - 1) / 10));
        return part * this.MAX_DURATION_MS;
    }

    private requestAnimFrame() {
        if (this.animRafHandle !== null) return;
        this.animRafHandle = requestAnimationFrame(() => {
            this.animRafHandle = null;
            this.stepAnimation();
        });
    }

    private stepAnimation() {
        const now = performance.now();
        const elapsed = now - this.animStartTime;
        const t = this.animDuration <= 0 ? 1 : Math.min(1, elapsed / this.animDuration);
        const eased = this.easeOut(t);

        this.scrollX = this.animStartX + (this.animEndX - this.animStartX) * eased;
        this.scrollY = this.animStartY + (this.animEndY - this.animStartY) * eased;

        this.view.triggerRepaint();

        if (t < 1) {
            this.requestAnimFrame();
        } else {
            this.scrollX = this.animEndX;
            this.scrollY = this.animEndY;
            this.view.triggerRepaint();
        }
    }

    private easeOut(t: number): number {
        return 1 - Math.pow(1 - t, 3);
    }

    private cancelAnimation() {
        if (this.animRafHandle !== null) {
            cancelAnimationFrame(this.animRafHandle);
            this.animRafHandle = null;
        }
    }
}

export enum ScrollMode {
    Smooth,
    Instant
}