import {HtmlComponent} from "../../../../../core/ui/engine/components/HtmlComponent";
import {HTMLUtils} from "../../../../../editor/utils/HTMLUtils";
import {TaskbarBrand} from "./TaskbarBrand";
import {TaskbarSearchBar} from "./TaskbarSearchBar";
import {TaskbarTopbarActions} from "./TaskbarTopbarActions";

/**
 * The editor main taskbar
 *
 * @author Atzitz Amos
 * @date 11/6/2025
 * @since 1.0.0
 */
export class ShadowTaskbar extends HtmlComponent {
    constructor(root: HTMLElement) {
        super(HTMLUtils.createDiv("shadow-taskbar", root));

        this.addChild(new TaskbarBrand(this.getUnderlyingElement()));
        this.addChild(new TaskbarSearchBar(this.getUnderlyingElement()));
        this.addChild(new TaskbarTopbarActions(this.getUnderlyingElement()));
    }

    draw() {
        this.drawChildren();
    }
}
