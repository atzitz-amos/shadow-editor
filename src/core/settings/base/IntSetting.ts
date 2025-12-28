import {SettingBase} from "./SettingBase";

/**
 *
 * @author Atzitz Amos
 * @date 11/2/2025
 * @since 1.0.0
 */
export class IntSetting extends SettingBase<number> {
    private minValue: number | null = null;
    private maxValue: number | null = null;

    constructor(key: string) {
        super(key);
    }

    public setRange(min: number, max: number): IntSetting {
        this.minValue = min;
        this.maxValue = max;
        return this;
    }

    public validate(value: number): boolean {
        if (!Number.isInteger(value)) {
            return false;
        }
        if (this.minValue !== null && value < this.minValue) {
            return false;
        }
        if (this.maxValue !== null && value > this.maxValue) {
            return false;
        }
        return true;
    }
}
