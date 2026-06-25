import {TextRange} from "../../../../editor/core/coordinate/range/TextRange";

/**
 *
 * @author Atzitz Amos
 * @date 6/6/2026
 * @since 1.0.0
 */
export class SourceModificationRecord {
    constructor(public readonly range: TextRange, public readonly newText: string) {
    }
}
