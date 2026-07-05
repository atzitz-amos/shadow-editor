import {IdeButton} from "./IdeButton";
import {AbstractAction} from "../../../actions/AbstractAction";
import {UIVariant} from "../theme/UIVariant";
import {ShortcutBadge} from "../keybind/ShortcutBadge";
import {KeybindManager} from "../../../keybinds/KeybindManager";
import {ActionRunnerUtils} from "../../../actions/ActionRunnerUtils";

/**
 *
 * @author Atzitz Amos
 * @date 7/3/2026
 * @since 1.0.0
 */
export class IdeActionButton extends IdeButton {
    private readonly afterActionRanListeners: (() => void)[] = [];

    constructor(msg: string, private readonly action: AbstractAction, variant: UIVariant = UIVariant.PRIMARY) {
        super(msg, variant);

        this.onClick(() => this._onClick());
    }

    draw() {
        super.draw();
        this.getUnderlyingElement().style.justifyContent = "space-between";
        this.getUnderlyingElement().style.alignItems = "baseline";

        let effectiveKeybind = KeybindManager.getInstance().getEffectiveKeybind(this.action.getId());
        if (!effectiveKeybind) return;

        this.addChild(new ShortcutBadge(this.getUnderlyingElement(), effectiveKeybind))
        this.drawChildren();
    }

    afterActionRan(callback: () => void) {
        this.afterActionRanListeners.push(callback);
    }

    private _onClick() {
        console.log("click");
        ActionRunnerUtils.runWithCallback(this.action, null, () => {
            for (const listener of this.afterActionRanListeners) {
                listener();
            }
        });
    }
}
