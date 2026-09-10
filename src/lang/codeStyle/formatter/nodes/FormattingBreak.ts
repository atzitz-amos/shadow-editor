import {FormattingNode} from "./FormattingNode";

/**
 *
 * @author Atzitz Amos
 * @date 9/4/2026
 * @since 1.0.0
 */
export class FormattingBreak extends FormattingNode {

    constructor(private readonly replaceWith: string, private readonly force: boolean) {
        super();
    }

    public static ifParentExpanded(otherwise: string): FormattingBreak {
        return new FormattingBreak(otherwise, false);
    }

    public static forced(): FormattingBreak {
        return new FormattingBreak("", true);
    }

    isForced(): boolean {
        return this.force;
    }

    getReplacementString(): string {
        return this.replaceWith;
    }
}
