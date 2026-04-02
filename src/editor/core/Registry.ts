export type HasId = { id: string };

export class Registry {
    private static actionIdCounter: number = 0;

    static getActionIdFor(name: string): string {
        return `${this.actionIdCounter++}-${name}`;
    }
}