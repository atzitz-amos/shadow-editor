import {SettingCategory} from "./SettingCategory";

/**
 * Represent the basic setting categories available in the editor.
 *
 * @author Atzitz Amos
 * @date 11/2/2025
 * @since 1.0.0
 */
export class SettingCategories {
    public static readonly APPEARANCE: SettingCategory = new SettingCategory("Appearance", "Settings related to the visual appearance of the editor.");
    public static readonly EDITOR: SettingCategory = new SettingCategory("Editor", "Settings related to the behavior and functionality of the code editor.");
    public static readonly KEYBINDINGS: SettingCategory = new SettingCategory("Keybindings", "Settings related to keyboard shortcuts and key mappings.");
    public static readonly PLUGINS: SettingCategory = new SettingCategory("Plugins", "Settings related to installed plugins and extensions.");

    public static readonly THEMES: SettingCategory = SettingCategories.APPEARANCE.createSubCategory("Themes", "Settings related to color schemes and themes of the editor.");
}
