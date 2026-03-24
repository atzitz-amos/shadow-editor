import {IntSetting} from "../../core/settings/base/IntSetting";
import {SettingCategories} from "../../core/settings/category/SettingCategories";
import {ColorSetting} from "../../core/settings/base/ColorSetting";

/**
 * Defines the editor's visual settings
 *
 * @author Atzitz Amos
 * @date 11/2/2025
 * @since 1.0.0
 */
export class VisualSettings {
    public static readonly LINE_HEIGHT = new IntSetting("editor.visual.lineHeight")
        .in(SettingCategories.APPEARANCE)
        .setDescription("The line height of the editor in pixels")
        .asCssProperty("--editor-line-height", "px")
        .defaultsTo(20);

    public static readonly CARET_HEIGHT = new IntSetting("editor.visual.caretHeight")
        .in(SettingCategories.APPEARANCE)
        .setDescription("The height of the caret in pixels")
        .asCssProperty("--editor-caret-height", "px")
        .defaultsTo(18);

    public static readonly FONT_SIZE = new IntSetting("editor.visual.fontSize")
        .in(SettingCategories.APPEARANCE)
        .setDescription("The font size of the editor in pixels")
        .asCssProperty("--editor-font-size", "px")
        .defaultsTo(15);

    public static readonly THEME_ROOT_BG_COLOR = new ColorSetting("editor.visual.theme.rootBackgroundColor")
        .in(SettingCategories.THEMES)
        .setDescription("The background color of the editor")
        .asCssProperty("--editor-root-bg-color")
        .defaultsTo("#090c14");

    public static readonly THEME_ROOT_BORDER_COLOR = new ColorSetting("editor.visual.theme.rootBorderColor")
        .in(SettingCategories.THEMES)
        .setDescription("The color of the editor border")
        .asCssProperty("--editor-root-border-color")
        .defaultsTo("none");

    public static readonly THEME_GUTTER_SEPARATOR_COLOR = new ColorSetting("editor.visual.theme.gutterSeparatorColor")
        .in(SettingCategories.THEMES)
        .setDescription("The color of the gutter separator")
        .asCssProperty("--editor-gutter-separator-color")
        .defaultsTo("#181d2c");

    public static readonly THEME_CARET_COLOR = new ColorSetting("editor.visual.theme.caretColor")
        .in(SettingCategories.THEMES)
        .setDescription("The color of the caret")
        .asCssProperty("--editor-caret-color")
        .defaultsTo("#ffffff");

    public static readonly THEME_GUTTER_COLOR = new ColorSetting("editor.visual.theme.gutterColor")
        .in(SettingCategories.THEMES)
        .setDescription("The color of the gutter")
        .asCssProperty("--editor-gutter-color")
        .defaultsTo("#93969f");


    public static readonly THEME_SELECTION_COLOR = new ColorSetting("editor.visual.theme.selectionColor")
        .in(SettingCategories.THEMES)
        .setDescription("The color of the selection highlight")
        .asCssProperty("--editor-selection-color")
        .defaultsTo("#154077");

    public static readonly THEME_ACTIVE_LINE_COLOR = new ColorSetting("editor.visual.theme.activeLineColor")
        .in(SettingCategories.THEMES)
        .setDescription("The color of the active line highlight")
        .asCssProperty("--editor-active-line-color")
        .defaultsTo("#26282e");

    public static readonly THEME_ACTIVE_LINE_GUTTER_COLOR = new ColorSetting("editor.visual.theme.activeLineGutterColor")
        .in(SettingCategories.THEMES)
        .setDescription("The color of the active line gutter highlight")
        .asCssProperty("--editor-active-line-gutter-color")
        .defaultsTo("#283234");
}
