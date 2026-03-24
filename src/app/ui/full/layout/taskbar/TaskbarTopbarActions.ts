import {HtmlComponent} from "../../../../../core/ui/engine/components/HtmlComponent";
import {HTMLUtils} from "../../../../../editor/utils/HTMLUtils";
import {TaskbarPulse} from "./TaskbarPulse";

/**
 *
 * @author Atzitz Amos
 * @date 2/28/2026
 * @since 1.0.0
 */
export class TaskbarTopbarActions extends HtmlComponent {
    private readonly notificationsButton: HTMLElement;
    private readonly profileIcon: HTMLElement

    constructor(root: HTMLElement) {
        super(HTMLUtils.createDiv("topbar-actions", root));

        this.notificationsButton = HTMLUtils.createElement("button.icon-button");
        this.notificationsButton.title = "Notifications";
        this.notificationsButton.innerHTML = `<i class="fa-regular fa-bell"></i>`;

        this.profileIcon = HTMLUtils.createElement("button.icon-button");
        this.profileIcon.title = "Profile";
        this.profileIcon.innerHTML = `<span class="avatar">AS</span>`;

        this.addChild(new TaskbarPulse(this.getUnderlyingElement()));
    }

    draw(): void {
        this.addHtmlElement(this.notificationsButton);
        this.addHtmlElement(this.profileIcon);

        this.drawChildren();
    }
}
