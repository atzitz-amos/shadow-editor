import {ITab} from "../../app/ui/tabs/ITab";

export type HasId = { id: string };

export class Registry {
    private static actionIdCounter: number = 0;
    private static tabIdCounter: number = 0;

    static getActionIdFor(name: string): string {
        return `${this.actionIdCounter++}-${name}`;
    }

    static getTabId(tab: ITab) {
        return `tab-${tab.getTitle().replaceAll(" ", "-").toLowerCase()}-${this.tabIdCounter++}`;
    }
}