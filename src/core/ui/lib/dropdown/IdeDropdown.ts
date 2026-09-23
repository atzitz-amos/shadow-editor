import {UIComponentMixin} from "../../engine/components/UIComponent";
import {Focusable} from "../../engine/mixins/Focusable";
import {HTMLUtils} from "../../../../editor/utils/HTMLUtils";

/**
 *
 * @author Atzitz Amos
 * @date 9/12/2026
 * @since 1.0.0
 */
export class IdeDropdown extends UIComponentMixin(Focusable) {

    constructor(parent: HTMLElement) {
        super(HTMLUtils.createDiv("ide-dropdown", parent));


    }

    public draw(): void {
        throw new Error("Method not implemented.");
    }
}
