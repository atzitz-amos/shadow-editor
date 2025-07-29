export class Registry {
    private static componentIdCounter: number = 0;
    private static actionIdCounter: number = 0;

    static getComponentId(componentName: string): string {
        return `${componentName}-${this.componentIdCounter++}`;
    }

    static getActionId(name: string): string {
        return `${this.actionIdCounter++}-${name}`;
    }
}