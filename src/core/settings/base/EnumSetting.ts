import {StringSetting} from "./StringSetting";

/**
 *
 * @author Atzitz Amos
 * @date 11/2/2025
 * @since 1.0.0
 */
export class EnumSetting extends StringSetting {
    private allowedValues: Set<string> = new Set<string>();

    constructor(key: string) {
        super(key);
    }

    public oneOf(...values: string[]): void {
        this.allowedValues = new Set<string>(values);
    }

    public validate(value: string): boolean {
        if (this.allowedValues.size > 0 && !this.allowedValues.has(value)) {
            return false;
        }
        return super.validate(value);
    }
}
