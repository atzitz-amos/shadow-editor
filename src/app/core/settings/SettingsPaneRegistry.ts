import {ExtensionPoint} from "../../../core/plugins/extensionPoints/ExtensionPoint";
import {SettingsPaneBase} from "./SettingsPaneBase";

/**
 *
 * @author Atzitz Amos
 * @date 8/6/2026
 * @since 1.0.0
 */
export class SettingsPaneRegistry {
    public static readonly SETTINGS_PANE_EP = new ExtensionPoint<SettingsPaneBase>("settings/pane", SettingsPaneBase);
}
