import {HtmlComponent} from "../../../../../core/ui/engine/components/HtmlComponent";
import {HTMLUtils} from "../../../../../editor/utils/HTMLUtils";
import {SRailButton} from "./SRailButton";

/**
 *
 * @author Atzitz Amos
 * @date 3/3/2026
 * @since 1.0.0
 */
export class SLeftActionRail extends HtmlComponent {
    private readonly actionRailButtons: SRailButton[] = [];

    constructor(root: HTMLElement) {
        super(HTMLUtils.createElement("nav.rail", root));

        this.actionRailButtons.push(new SRailButton(this.getUnderlyingElement(), "Projects", "fa-diagram-project"));
        this.actionRailButtons.push(new SRailButton(this.getUnderlyingElement(), "Commits", "fa-timeline"));
        this.actionRailButtons.push(new SRailButton(this.getUnderlyingElement(), "Tasks", "fa-list-check"));
        this.actionRailButtons.push(new SRailButton(this.getUnderlyingElement(), "Snippets", "fa-scissors"));
        this.actionRailButtons.push(new SRailButton(this.getUnderlyingElement(), "Settings", "fa-gear"));

        this.actionRailButtons[0].setActive(true);

        for (let button of this.actionRailButtons) {
            this.addChild(button);
        }
    }

    draw(): void {
        this.drawChildren();
    }

}
