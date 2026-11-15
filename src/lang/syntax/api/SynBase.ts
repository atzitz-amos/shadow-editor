import {HasRange, TextRange} from "../../../core/text/range/TextRange";
import {SynNodeVisitor} from "../visitors/SynNodeVisitor";

/**
 *
 * @author Atzitz Amos
 * @date 6/29/2026
 * @since 1.0.0
 */
export interface SynBase extends HasRange {
    getTextRange(): TextRange;

    toDebugString(): string;

    accept(visitor: SynNodeVisitor): void;
}
