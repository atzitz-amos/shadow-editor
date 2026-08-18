import {HTMLUtils} from "../../../../../editor/utils/HTMLUtils";
import {SFooterSection} from "./SFooterSection";
import {UIComponent} from "../../../../../core/ui/engine/components/UIComponent";
import {GlobalState} from "../../../../../core/global/GlobalState";
import {LatencyUpdatedEvent} from "../../../../../editor/core/latency/LatencyUpdatedEvent";

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

        this.left.addPill("git", "main", "fa-brands fa-git-alt");
        this.left.addPill("project", "shadow-editor");
        this.left.addPill("profile", "Nocturne profile");
        this.right.addPill("spaces", "Spaces: 4", null, "soft");
        this.right.addPill("encoding", "UTF-8", null, "soft");
        this.right.addPill("errors", "2 errors", null, "error");
        this.right.addPill("warnings", "1 warning", null, "warning");
        this.right.addPill("latency", "16 ms", null, "soft");

        this.setupEvents();
    }

    draw() {
        this.drawChildren();
    }

    private setupEvents() {
        GlobalState.getMainEventBus().subscribe(this, LatencyUpdatedEvent.SUBSCRIBER, e => {
            this.right.getPill("latency").setText(`${e.getLatency().toFixed(0)} ms`);
        });
    }
}
