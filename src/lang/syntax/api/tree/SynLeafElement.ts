import {EditorURI} from "../../../../core/uri/EditorURI";
import {TextRange} from "../../../../editor/core/coordinate/range/TextRange";
import {SynNodeVisitor} from "../../visitors/SynNodeVisitor";
import {SynDocument} from "../document/SynDocument";
import {SynNode} from "../SynNode";
import {SynParentElement} from "./SynParentElement";

/**
 *
 * @author Atzitz Amos
 * @date 6/29/2026
 * @since 1.0.0
 */
export abstract class SynLeafElement implements SynNode {

    private parent: SynParentElement | null = null;

    constructor(public readonly document: SynDocument) {
    }

    getSynDocument(): SynDocument {
        return this.document;
    }

    getChildren(): SynNode[] {
        return [];
    }

    _setParent(parent: SynParentElement): void {
        this.parent = parent;
    }

    getParent(): SynParentElement | null {
        return this.parent;
    }

    nextSibling(): SynNode | null {
        if (!this.parent) return null;

        const siblings = this.parent.getChildren();
        const index = siblings.indexOf(this);
        if (index === -1 || index === siblings.length - 1) return null;

        return siblings[index + 1];
    }

    previousSibling(): SynNode | null {
        if (!this.parent) return null;

        const siblings = this.parent.getChildren();
        const index = siblings.indexOf(this);
        if (index <= 0) return null;

        return siblings[index - 1];
    }

    isSynthetic(): boolean {
        return false;
    }

    isParentElement(): this is never {
        return false;
    }

    abstract toTreeRepr(): string;

    abstract getTokenCount(): number;

    abstract getTextRange(): TextRange;

    abstract toDebugString(): string;

    abstract accept(visitor: SynNodeVisitor): void;

    abstract getURI(): EditorURI;
}
