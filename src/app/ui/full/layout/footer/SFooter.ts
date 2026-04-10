import {HTMLUtils} from "../../../../../editor/utils/HTMLUtils";
import {SFooterSection} from "./SFooterSection";
import {UIComponent} from "../../../../../core/ui/engine/components/UIComponent";

/**
 *
 * @author Atzitz Amos
 * @date 2/28/2026
 * @since 1.0.0
 */
export class SFooter extends UIComponent {
    private readonly left: SFooterSection;
    private readonly right: SFooterSection;

    constructor(root: HTMLElement) {
        super(HTMLUtils.createElement("footer.shell-footer", root));

        this.left = new SFooterSection(this.getUnderlyingElement(), "footer-left");
        this.addChild(this.left);

        this.right = new SFooterSection(this.getUnderlyingElement(), "footer-right");
        this.addChild(this.right);

        this.left.addPill("main", "fa-brands fa-git-alt");
        this.left.addPill("shadow-editor");
        this.left.addPill("Nocturne profile");
        this.right.addPill("Spaces: 4", null, "soft");
        this.right.addPill("UTF-8", null, "soft");
        this.right.addPill("2 errors", null, "error");
        this.right.addPill("1 warning", null, "warning");
        this.right.addPill("16 ms", null, "soft");
    }

    draw() {
        this.drawChildren();
    }
}
