import {UIComponent} from "../components/UIComponent";

/**
 *
 * @author Atzitz Amos
 * @date 9/12/2026
 * @since 1.0.0
 */
export abstract class ValuedComponent<T> extends UIComponent {
    private onValueChangedCallback: ((value: T | null) => void);
    private onValueConfirmedCallback: ((value: T | null) => void);

    public setOnValueChanged(callback: (value: T | null) => void): void {
        this.onValueChangedCallback = callback;
    }

    public setOnValueConfirmed(callback: (value: T | null) => void): void {
        this.onValueConfirmedCallback = callback;
    }

    abstract getValue(): T | null;

    protected triggerValueChanged(): void {
        if (this.onValueChangedCallback) {
            this.onValueChangedCallback(this.getValue());
        }
    }

    protected triggerValueConfirmed(): void {
        if (this.onValueConfirmedCallback) {
            this.onValueConfirmedCallback(this.getValue());
        }
    }
}
