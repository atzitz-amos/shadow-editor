/**
 *
 * @author Atzitz Amos
 * @date 8/2/2026
 * @since 1.0.0
 */
export interface HighlightEffect {
    apply(element: HTMLElement): void;

    clone(): HighlightEffect;

    getState(): any;

    resume(state: any): void;
}
