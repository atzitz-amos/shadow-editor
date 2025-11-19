import {SettingBase} from "./SettingBase";

/**
 *
 * @author Atzitz Amos
 * @date 11/2/2025
 * @since 1.0.0
 */
export class StringSetting extends SettingBase<string> {

    constructor(key: string) {
        super(key);
    }
}
