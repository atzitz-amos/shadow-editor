import {SynElement} from "./SynElement";
import {TextRange} from "../../../../../editor/core/coordinate/TextRange";

/**
 * Most basic syntax node in the syntax tree.
 * Can represent an ASTNode, a token or an actual syntax element ({@link SynElement}).
 *
 * @author Atzitz Amos
 * @date 11/25/2025
 * @since 1.0.0
 */
export interface SynNode {
    getChildren(): SynNode[];

    getTextRange(): TextRange;

    getParent(): SynElement | null;

    _setParent(parent: SynElement): void;

    isSynElement<T extends SynNode>(this: T): boolean;
}
