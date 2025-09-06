import {Popup, PopupBuilder} from "../ui/components/inline/popup/Popup";
import {Component} from "./components/Component";

export type HasId = { id: string };

export class Registry {
    private static componentIdCounter: number = 0;
    private static actionIdCounter: number = 0;

    private static components = new Map<string, Component>();
    private static popups: Map<string, Popup> = new Map();

    static getComponentIDFor(component: Component): string {
        const id = `${component.name}-${this.componentIdCounter++}`;
        this.components.set(id, component);
        return id;
    }

    static getComponentById(id: string): Component | undefined {
        return this.components.get(id);
    }

    static getActionIdFor(name: string): string {
        return `${this.actionIdCounter++}-${name}`;
    }

    static getPopup(owner: PopupBuilder): Popup {
        console.log(this.popups.get(owner.id));

        if (!this.popups.has(owner.id))
            this.popups.set(owner.id, owner.createPopup());
        return this.popups.get(owner.id)!;
    }

    static registerPopup(owner: HasId, popup: Popup) {
        this.popups.set(owner.id, popup);
        return this.getComponentIDFor(popup);
    }
}