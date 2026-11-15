import {HasRange, TextRange} from "../../../editor/core/coordinate/range/TextRange";

/**
 *
 * @author Atzitz Amos
 * @date 10/26/2026
 * @since 1.0.0
 */
export class SynPlaceholder implements HasRange {

    constructor(private readonly range: TextRange) {
    }

    getTextRange() {
        return this.range;
    }
}
