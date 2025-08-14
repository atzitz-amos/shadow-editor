import {Component} from "../../Component";
import {View} from "../../../View";
import {InlineComponent} from "../Inline"
import {Registry} from "../../../../core/Registry";
import {Editor} from "../../../../Editor";

export abstract class Popup implements Component {
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
        let bbox = this.element.getBoundingClientRect();
        let oBbox = this.owner.element?.getBoundingClientRect();
        return (bbox.left <= x && bbox.right >= x && bbox.top <= y && bbox.bottom >= y)
            || (oBbox && oBbox.left <= x && oBbox.right >= x && oBbox.top <= y && oBbox.bottom >= y)!;
    }

    close(): void {
        this.isShown = false;
        this.element.style.display = "none";
    }

    abstract render(view: View): HTMLDivElement;

    show(): void {
        this.isShown = true;
        this.element.style.display = "flex";
    }

    awaitClosure(): void {
        this.element.addEventListener("mouseleave", e => {
            this.close();
        });
    }
}

export type PopupBuilder = {
    id: string;
    createPopup(): Popup
};