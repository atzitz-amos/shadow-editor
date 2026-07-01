import {TextRange} from "../../../../editor/core/coordinate/range/TextRange";
import {SynNodeVisitor} from "../utils/visitors/SynNodeVisitor";

/**
 *
 * @author Atzitz Amos
 * @date 6/29/2026
 * @since 1.0.0
 */
export interface SynBase {
    getTextRange(): TextRange;

    toDebugString(): string;

    accept(visitor: SynNodeVisitor): void;
}
