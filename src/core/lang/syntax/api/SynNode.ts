import {SynASTElement} from "./tree/SynASTElement";
import {TextRange} from "../../../../editor/core/coordinate/range/TextRange";
import {URILocatedResource} from "../../../uri/URILocatedResource";
import {SynNodeVisitor} from "../utils/visitors/SynNodeVisitor";
import {SynDocument} from "./document/SynDocument";
import {SynParentElement} from "./tree/SynParentElement";
import {SynScope} from "./scope/SynScope";
import {SynBase} from "./SynBase";

/**
 * Most basic syntax node in the syntax tree.
 * Can represent an ASTNode, a token or an actual syntax element ({@link SynASTElement}).
 *
 * @author Atzitz Amos
 * @date 11/25/2025
 * @since 1.0.0
 */
export interface SynNode extends SynBase, URILocatedResource {
    getSynDocument(): SynDocument;

    getChildren(): SynNode[];

    getParentScope(): SynScope;

    getParent(): SynParentElement | null;

    nextSibling(): SynNode | null;

    previousSibling(): SynNode | null;

    _setParent(parent: SynParentElement): void;

    toTreeRepr(): string;

    isSynthetic(): boolean;
}
