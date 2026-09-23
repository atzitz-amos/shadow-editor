import {AbstractAction} from "../AbstractAction";
import {ActionGroupPlacement} from "./ActionGroupPlacement";
import {ActionManager} from "../ActionManager";

/**
 *
 * @author Atzitz Amos
 * @date 9/19/2026
 * @since 1.0.0
 */
export abstract class ActionGroup {
    private static instances = new Map<string, ActionGroup>();

    private readonly priorities = new Map<string, number>();

    public constructor(protected readonly actions: AbstractAction[] = []) {
        const id = this.getId();
        if (ActionGroup.instances.has(id)) {
            throw new Error(`Action group with id '${id}' already exists`);
        }
        ActionGroup.instances.set(id, this);
    }

    public static getInstance(id: string): ActionGroup | null {
        return ActionGroup.instances.get(id)!;
    }

    public getActions(): AbstractAction[] {
        const manager = ActionManager.getInstance();
        return this.actions.filter(action => manager.isActionActive(action));
    }

    public addAction(action: AbstractAction, place?: ActionGroupPlacement): void {
        const id = action.getId();

        if (place?.priority !== undefined) {
            this.priorities.set(id, place.priority);
        }

        this.actions.splice(this.resolveInsertIndex(place), 0, action);
    }

    abstract getId(): string;

    private resolveInsertIndex(place?: ActionGroupPlacement): number {
        if (!place) {
            return this.actions.length;
        }

        if (place.before !== undefined) {
            const i = this.indexOfId(place.before);
            if (i !== -1) return i;
        }

        if (place.after !== undefined) {
            const i = this.indexOfId(place.after);
            if (i !== -1) return i + 1;
        }

        if (place.index !== undefined) {
            return Math.max(0, Math.min(place.index, this.actions.length));
        }

        if (place.priority !== undefined) {
            const i = this.actions.findIndex(
                a => (this.priorities.get(a.getId()) ?? 0) < place.priority!
            );
            if (i !== -1) return i;
        }

        return this.actions.length;
    }

    private indexOfId(id: string): number {
        return this.actions.findIndex(a => a.getId() === id);
    }
}