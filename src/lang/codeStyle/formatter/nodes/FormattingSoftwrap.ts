/**
 *
 * @author Atzitz Amos
 * @date 9/4/2026
 * @since 1.0.0
 */
export class FormattingSoftwrap {
    private expanded: boolean = false;

    constructor(private readonly preserve: boolean) {
    }

    shouldPreserve(): boolean {
        return this.preserve;
    }

    wrapAt(): void {
        this.expanded = true;
    }

    isExpanded(): boolean {
        return this.expanded;
    }
}
