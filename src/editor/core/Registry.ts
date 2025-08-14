import {Popup, PopupBuilder} from "../ui/components/inline/popup/Popup";

export type HasId = { id: string };

export class Registry {
    private static componentIdCounter: number = 0;
    private static actionIdCounter: number = 0;

    private static popups: Map<string, Popup> = new Map();

    static getComponentId(componentName: string): string {
        return `${componentName}-${this.componentIdCounter++}`;
    }

    static getActionId(name: string): string {
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
        return this.getComponentId("popup");
    }
}