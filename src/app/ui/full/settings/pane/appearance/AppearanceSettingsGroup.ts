import {SettingsPaneGroup} from "../../../../../core/settings/SettingsPaneGroup";

/**
 *
 * @author Atzitz Amos
 * @date 9/13/2026
 * @since 1.0.0
 */
export class AppearanceSettingsGroup extends SettingsPaneGroup {
    public static readonly INSTANCE = new AppearanceSettingsGroup();

    getName(): string {
        return "Appearance";
    }

    getDescription(): string {
        return "Settings related to the appearance of the IDE, including themes, colors, and fonts.";
    }

    getParentGroup(): SettingsPaneGroup | null {
        return null;
    }

}
