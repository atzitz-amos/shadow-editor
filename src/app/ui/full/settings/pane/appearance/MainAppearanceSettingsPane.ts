import {UIComponent} from "../../../../../../core/ui/engine/components/UIComponent";
import {SettingsPaneBase} from "../../../../../core/settings/SettingsPaneBase";
import {SettingsPaneGroup} from "../../../../../core/settings/SettingsPaneGroup";
import {AppearanceSettingsGroup} from "./AppearanceSettingsGroup";
import {HTMLUtils} from "../../../../../../editor/utils/HTMLUtils";

class MainAppearanceSettingsPaneComponent extends UIComponent {

    constructor() {
        super(HTMLUtils.createDiv("main-appearance-settings-pane"));
    }

    public draw(): void {
        this.setInnerHTML("No content");
    }
}


/**
 *
 * @author Atzitz Amos
 * @date 9/13/2026
 * @since 1.0.0
 */
export class MainAppearanceSettingsPane extends SettingsPaneBase {
    public static readonly INSTANCE = new MainAppearanceSettingsPane();

    private readonly element: UIComponent;

    constructor() {
        super();
        this.element = new MainAppearanceSettingsPaneComponent();
    }

    getName(): string {
        return "Appearance";
    }

    getParentGroup(): SettingsPaneGroup | null {
        return AppearanceSettingsGroup.INSTANCE;
    }

    getPaneContent(): UIComponent {
        return this.element;
    }
}
