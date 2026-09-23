import {AbstractDialog} from "../../../../../core/ui/lib/dialog/IdeDialog";
import {HTMLUtils} from "../../../../../editor/utils/HTMLUtils";
import {SettingsPaneRegistry} from "../../../../core/settings/SettingsPaneRegistry";
import {SettingsPaneBase} from "../../../../core/settings/SettingsPaneBase";
import {SettingsPaneGroup} from "../../../../core/settings/SettingsPaneGroup";
import {CollectionUtils} from "../../../../../editor/utils/collection/CollectionUtils";

/**
 *
 * @author Atzitz Amos
 * @date 9/13/2026
 * @since 1.0.0
 */

interface GroupEntry {
    element: HTMLElement;
    depth: number;
}

interface BreadcrumbEntry {
    name: string;
    onClick: () => void;
}

export class SettingsDialog extends AbstractDialog {
    private readonly element: HTMLElement;

    constructor() {
        super();

        this.element = HTMLUtils.createDiv("settings-dialog");
        const topbar = HTMLUtils.createDiv("settings-dialog-topbar", this.element);
        topbar.innerHTML = `<div class="breadcrumbs"><span>Settings</span></div><i class="fa-solid fa-close"></i>`

        this.element.setAttribute("tabindex", "-1");
        setTimeout(() => this.element.focus(), 0);
        this.element.addEventListener("keydown", e => {
            this.onKeyDown(e);
        })

        const mainContent = HTMLUtils.createDiv("settings-dialog-main", this.element);
        mainContent.innerHTML = `
            <div class="left-content"></div>
            <div class="right-content"></div>
        `;

        this.draw(SettingsPaneRegistry.getAllSettingsPanes())
    }

    protected getPopupElement(): HTMLElement {
        return this.element;
    }

    private onKeyDown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            this.close(true);
        }
    }

    private draw(panes: SettingsPaneBase[]) {
        const leftContent = this.element.querySelector(".left-content") as HTMLElement;
        const rightContent = this.element.querySelector(".right-content") as HTMLElement;

        leftContent.innerHTML = "<span class='left-content-header'>SETTINGS</span>";
        rightContent.innerHTML = "";

        const groupToElement: Map<SettingsPaneGroup, GroupEntry> = new Map<SettingsPaneGroup, GroupEntry>();

        panes.forEach(pane => {
            let parent: HTMLElement;
            let depth: number;

            const parentGroup = pane.getParentGroup();
            if (parentGroup) {
                const entry = CollectionUtils.getOrSet(
                    groupToElement,
                    parentGroup,
                    () => this.createGroupElement(leftContent, parentGroup, groupToElement, 0)
                );
                parent = entry.element;
                depth = entry.depth + 1;
            } else {
                parent = leftContent;
                depth = 0;
            }

            const navElement = HTMLUtils.createElement("span.settings-left-nav-element");
            navElement.style.setProperty("--depth", String(depth));
            navElement.addEventListener("click", () => {
                this.setActiveElement(navElement);
                this.onNav(pane);
            })

            navElement.textContent = pane.getName();
            parent.appendChild(navElement);
        });
    }

    private createGroupElement(
        parent: HTMLElement,
        group: SettingsPaneGroup,
        groupToElements: Map<SettingsPaneGroup, GroupEntry>,
        depth: number
    ): GroupEntry {
        let actualParent = parent;
        let actualDepth = depth;

        if (group.getParentGroup()) {
            const parentGroup = group.getParentGroup()!;
            const entry = CollectionUtils.getOrSet(
                groupToElements,
                parentGroup,
                () => this.createGroupElement(parent, parentGroup, groupToElements, depth)
            );
            actualParent = entry.element;
            actualDepth = entry.depth + 1;
        }

        const details = HTMLUtils.createElement("details.settings-left-group", actualParent);
        details.style.setProperty("--depth", String(actualDepth));

        const summary = document.createElement("summary");
        details.appendChild(summary);
        const arrow = document.createElement("span");
        arrow.className = "settings-left-group-arrow";
        summary.appendChild(arrow);
        summary.appendChild(document.createTextNode(group.getName()));
        summary.addEventListener("click", e => {
            this.setActiveElement(details);
            this.onGroup(group);

            if (e.target !== arrow) {
                e.preventDefault();
                (<HTMLDetailsElement>details).open = true;
            }
        });

        return {element: details, depth: actualDepth};
    }

    private setActiveElement(element: HTMLElement | null) {
        this.element
            .querySelectorAll(
                ".settings-left-group.active, .settings-left-nav-element.active, .settings-group-child.active"
            )
            .forEach(activeElement => activeElement.classList.remove("active"));
        element?.classList.add("active");
    }

    private onNav(pane: SettingsPaneBase) {
        const rightContent = this.element.querySelector(".right-content") as HTMLElement;
        rightContent.innerHTML = "";

        const content = pane.getPaneContent();
        rightContent.appendChild(content.getUnderlyingElement());
        content.draw();

        const selectedPane = pane;
        const groups: SettingsPaneGroup[] = [];
        let parentGroup = selectedPane.getParentGroup();
        while (parentGroup) {
            const group = parentGroup;
            groups.unshift(group);
            parentGroup = group.getParentGroup();
        }

        this.updateBreadcrumbs([
            ...groups.map(group => ({
                name: group.getName(),
                onClick: () => this.onGroup(group)
            })),
            {
                name: selectedPane.getName(),
                onClick: () => this.onNav(selectedPane)
            }
        ]);
    }

    private onGroup(group: SettingsPaneGroup) {
        const rightContent = this.element.querySelector(".right-content") as HTMLElement;
        rightContent.innerHTML = "";

        const children = SettingsPaneRegistry.getAllSettingsPanes()
            .filter(pane => pane.getParentGroup() === group);
        const childrenContainer = HTMLUtils.createDiv("settings-group-children", rightContent);

        const description = document.createElement("p");
        description.className = "settings-group-description";
        description.textContent = group.getDescription();
        childrenContainer.appendChild(description);

        children.forEach(child => {
            const childElement = HTMLUtils.createElement("span.settings-group-child", childrenContainer);
            childElement.textContent = child.getName();
            childElement.addEventListener("click", () => {
                this.setActiveElement(childElement);
                this.onNav(child);
            });
        });

        const groups: SettingsPaneGroup[] = [];
        let parentGroup = group.getParentGroup();
        while (parentGroup) {
            groups.unshift(parentGroup);
            parentGroup = parentGroup.getParentGroup();
        }

        groups.push(group);
        this.updateBreadcrumbs(groups.map(groupEntry => ({
            name: groupEntry.getName(),
            onClick: () => this.onGroup(groupEntry)
        })));
    }

    private updateBreadcrumbs(entries: BreadcrumbEntry[]) {
        const breadcrumbs = this.element.querySelector(".breadcrumbs") as HTMLElement;
        breadcrumbs.innerHTML = "<span>Settings</span>";
        const settings = breadcrumbs.firstElementChild as HTMLElement;
        settings.addEventListener("click", () => {
            (this.element.querySelector(".right-content") as HTMLElement).innerHTML = "";
            this.setActiveElement(null);
            this.updateBreadcrumbs([]);
        });

        for (const entry of entries) {
            const span = document.createElement("span");
            span.textContent = entry.name;
            span.addEventListener("click", entry.onClick);
            breadcrumbs.appendChild(document.createTextNode(" > "));
            breadcrumbs.appendChild(span);
        }
    }
}