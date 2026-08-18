import {HTMLUtils} from "../../../../../editor/utils/HTMLUtils";
import {SFooterPill} from "./SFooterPill";
import {UIComponent} from "../../../../../core/ui/engine/components/UIComponent";

/**
 *
 * @author Atzitz Amos
 * @date 3/4/2026
 * @since 1.0.0
 */
export class SFooterSection extends UIComponent {
    private readonly pills: Map<string, SFooterPill> = new Map<string, SFooterPill>();

    constructor(root: HTMLElement, className: string) {
        super(HTMLUtils.createDiv(className, root));
    }

    addPill(id: string, text: string, icon: string | null = null, style: string | null = null): SFooterPill {
        const pill = new SFooterPill(this.getUnderlyingElement(), text, icon, style);
        this.addChild(pill);
        this.pills.set(id, pill);
        return pill;
    }

    public getPill(id: string): SFooterPill {
        return this.pills.get(id)!;
    }

    draw(): void {
        this.drawChildren();
    }

}
