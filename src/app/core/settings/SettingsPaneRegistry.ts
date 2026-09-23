import {ExtensionPoint} from "../../../core/plugins/extensionPoints/ExtensionPoint";
import {SettingsPaneBase} from "./SettingsPaneBase";
import {MainAppearanceSettingsPane} from "../../ui/full/settings/pane/appearance/MainAppearanceSettingsPane";

/**
 *
 * @author Atzitz Amos
 * @date 8/6/2026
 * @since 1.0.0
 */
export class SettingsPaneRegistry {
    private static readonly SETTINGS_PANE_EP = new ExtensionPoint<SettingsPaneBase>("settings/pane", SettingsPaneBase)
        .withDefaultContributors(MainAppearanceSettingsPane.INSTANCE);

    public static getAllSettingsPanes(): SettingsPaneBase[] {
        return SettingsPaneRegistry.SETTINGS_PANE_EP.getAll();
    }
}
