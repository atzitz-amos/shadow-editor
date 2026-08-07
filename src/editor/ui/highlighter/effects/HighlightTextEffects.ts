import {HighlightEffect} from "./HighlightEffect";

/**
 *
 * @author Atzitz Amos
 * @date 8/2/2026
 * @since 1.0.0
 */
export class HighlightTextEffects {
    private effectStates: any[] = [];

    constructor(private effects: HighlightEffect[]) {
    }

    public static of(...attributes: HighlightEffect[]): HighlightTextEffects {
        return new HighlightTextEffects(attributes);
    }

    public getEffects(): HighlightEffect[] {
        return this.effects;
    }

    public with(effect: HighlightEffect): HighlightTextEffects {
        return new HighlightTextEffects([...this.effects, effect]);
    }

    public clone(): HighlightTextEffects {
        return new HighlightTextEffects(this.effects.map(effect => effect.clone()));
    }

    public applyTo(element: HTMLElement): void {
        for (let i = 0; i < this.effects.length; i++) {
            const effect = this.effects[i];
            if (this.effectStates[i]) {
                effect.resume(this.effectStates[i]);
            }
            effect.apply(element);
            this.effectStates[i] = effect.getState();
        }
    }
}
