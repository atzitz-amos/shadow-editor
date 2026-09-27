import {TextRange} from "../../../editor/core/coordinate/range/TextRange";

/**
 *
 * @author Atzitz Amos
 * @date 9/24/2026
 * @since 1.0.0
 */
export type SynModificationRecord = {
    range: TextRange,
    text: string
};
