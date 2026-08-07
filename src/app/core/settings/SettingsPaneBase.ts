import {UIComponent} from "../../../core/ui/engine/components/UIComponent";

/**
 *
 * @author Atzitz Amos
 * @date 8/6/2026
 * @since 1.0.0
 */
export abstract class SettingsPaneBase {
    abstract getName(): string;

    abstract getParentPane(): SettingsPaneBase | null;

    abstract getPaneContent(): UIComponent;
}
