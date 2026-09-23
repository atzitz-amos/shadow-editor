/**
 *
 * @author Atzitz Amos
 * @date 9/13/2026
 * @since 1.0.0
 */
export abstract class SettingsPaneGroup {
    abstract getName(): string;

    abstract getDescription(): string;

    abstract getParentGroup(): SettingsPaneGroup | null;
}
