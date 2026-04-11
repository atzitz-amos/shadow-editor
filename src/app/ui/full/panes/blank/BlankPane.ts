import {AbstractPane} from "../../../panes/pane/AbstractPane";
import {PaneDockPosition} from "../../../panes/pane/PaneDockPosition";
import {UIPaneComponent} from "../../../panes/ui/UIPaneComponent";
import {Icon} from "../../../../../core/ui/icons/Icon";
import {FaIcon} from "../../../../../core/ui/icons/FaIcon";

/**
 *
 * @author Atzitz Amos
 * @date 4/9/2026
 * @since 1.0.0
 */
export class BlankPane extends AbstractPane {
    getId(): string {
        return "blank";
    }

    getTitle(): string {
        return "Blank";
    }

    getIcon(): Icon {
        return FaIcon.faGift();
    }

    protected getPreferredDockPosition(): PaneDockPosition {
        return PaneDockPosition.LEFT;
    }

    protected createComponent(): UIPaneComponent {
        const pane = this;

        return new class extends UIPaneComponent {
            constructor() {
                super(pane);
            }

            public draw(): void {
                this.getUnderlyingElement().textContent = "This is a blank pane.";
            }
        }();
    }

}
