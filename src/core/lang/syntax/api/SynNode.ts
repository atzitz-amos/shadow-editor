import {SynElement} from "./SynElement";
import {TextRange} from "../../../../editor/core/coordinate/range/TextRange";
import {SynFile} from "./SynFile";
import {URILocatedResource} from "../../../uri/URILocatedResource";
import {SynNodeVisitor} from "../visitors/SynNodeVisitor";

/**
 * Most basic syntax node in the syntax tree.
 * Can represent an ASTNode, a token or an actual syntax element ({@link SynElement}).
 *
 * @author Atzitz Amos
 * @date 11/25/2025
 * @since 1.0.0
 */
export interface SynNode extends URILocatedResource {
    getSynFile(): SynFile;

    getChildren(): SynNode[];

    getTextRange(): TextRange;

    getParent(): SynElement | null;

    nextSibling(): SynNode | null;

    previousSibling(): SynNode | null;

    _setParent(parent: SynElement): void;

    isSynElement<T extends SynNode>(this: T): this is SynElement;

    toDebugString(): string;

    toTreeRepr(): string;

    accept(visitor: SynNodeVisitor): void;

    isSynthetic(): boolean;
}
