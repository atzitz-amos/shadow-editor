import {Document} from "../../../editor/core/document/Document";
import {ITab} from "./ITab";
import {Registry} from "../../../editor/core/Registry";

/**
 *
 * @author Atzitz Amos
 * @date 4/10/2026
 * @since 1.0.0
 */
export class EditorTab implements ITab {
    private position = 0;
    private active = false;

    private readonly id: string;

    constructor(private readonly title: string, private readonly document: Document) {
        this.id = Registry.getTabId(this);
    }

    getId(): string {
        return this.id;
    }

    getTitle(): string {
        return this.title;
    }

    getPosition(): number {
        return this.position;
    }

    setPosition(position: number): void {
        this.position = position;
    }

    isActive(): boolean {
        return this.active;
    }

    setActive(active: boolean): void {
        this.active = active;
    }

    getDocument(): Document {
        return this.document;
    }

}
