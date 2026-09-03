/**
 *
 * @author Atzitz Amos
 * @date 8/29/2026
 * @since 1.0.0
 */
export abstract class DebugToolTab {
    protected isSelected: boolean = false;

    setSelected(selected: boolean) {
        this.isSelected = selected;
    }

    abstract getName(): string;

    abstract getTitle(): string;

    abstract getElement(): HTMLElement;

    dispose() {

    }

    init() {

    }
}
