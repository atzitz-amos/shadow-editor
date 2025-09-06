import {Component} from "../../../../core/components/Component";
import {View} from "../../../View";
import {Registry} from "../../../../core/Registry";
import {Editor} from "../../../../Editor";
import {HTMLUtils} from "../../../../utils/HTMLUtils";
import {InlineComponent} from "../../../../core/components/InlineComponent";

export abstract class Popup implements Component {
    abstract name: string;
    id: string;

    isRendered: boolean = false;
    isShown: boolean = false;

    owner: InlineComponent;
    element: HTMLDivElement;

    protected constructor(owner: InlineComponent) {
        this.owner = owner;

        this.id = Registry.registerPopup(owner, this);
    }

    onDestroy(editor: Editor): void {
    }

    isInBound(x: number, y: number): boolean {
        if (!this.isShown || !this.element) return false;
        let owner = this.owner?.getRenderedView();
        return HTMLUtils.isInBound(this.element, x, y)
            || (owner && owner.isInBound(x, y))!;
    }

    close(): void {
        this.isShown = false;
        this.element.style.display = "none";
    }

    show(): void {
        this.isShown = true;
        this.element.style.display = "flex";
    }

    abstract render(view: View): HTMLDivElement;
}

export type PopupBuilder = {
    id: string;
    createPopup(): Popup
};