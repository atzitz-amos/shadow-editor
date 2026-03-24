import {HtmlComponent} from "../../../../../core/ui/engine/components/HtmlComponent";
import {HTMLUtils} from "../../../../../editor/utils/HTMLUtils";
import {SFooterPill} from "./SFooterPill";

/**
 *
 * @author Atzitz Amos
 * @date 3/4/2026
 * @since 1.0.0
 */
export class SFooterSection extends HtmlComponent {
    constructor(root: HTMLElement, className: string) {
        super(HTMLUtils.createDiv(className, root));
    }

    addPill(text: string, icon: string | null = null, style: string | null = null): SFooterPill {
        const pill = new SFooterPill(this.getUnderlyingElement(), text, icon, style);
        this.addChild(pill);
        return pill;
    }

    draw(): void {
        this.drawChildren();
    }

}
