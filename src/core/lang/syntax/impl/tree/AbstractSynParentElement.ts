import {TextRange} from "../../../../../editor/core/coordinate/range/TextRange";
import {EditorURI} from "../../../../uri/EditorURI";
import {SynDocument} from "../../api/document/SynDocument";
import {SynScope} from "../../api/scope/SynScope";
import {SynNode} from "../../api/SynNode";
import {SynParentElement} from "../../api/tree/SynParentElement";
import {TokenType} from "../../builder/tokens/TokenType";
import {SynNodeVisitor} from "../../utils/visitors/SynNodeVisitor";
import {SynTokenNode} from "../SynTokenNode";

/**
 *
 * @author Atzitz Amos
 * @date 6/29/2026
 * @since 1.0.0
 */
export abstract class AbstractSynParentElement implements SynParentElement {
    private parent: SynParentElement | null = null;
    private synthetic: boolean = false;

    constructor(protected readonly children: SynNode[]) {

    }

    abstract getParentScope(): SynScope;

    abstract getSynDocument(): SynDocument;

    abstract getTextRange(): TextRange;

    abstract toDebugString(): string;

    abstract getURI(): EditorURI;

    getChildren(withComments: boolean = true): SynNode[] {
        if (withComments) {
            return this.children;
        }
        return this.children.filter(child => !(child instanceof SynTokenNode) || (!child.token.isCommentToken() && !child.token.shouldSkip()));
    }

    * childrenIterator(filter: (element: SynParentElement) => boolean): Iterable<SynParentElement> {
        for (const child of this.children) {
            if (child instanceof AbstractSynParentElement && filter(child as SynParentElement)) {
                yield child as SynParentElement;
            }
            if (child instanceof AbstractSynParentElement) yield* (child as SynParentElement).childrenIterator(filter);
        }
    }

    toTreeRepr(): string {
        return this.constructor.name + " {\n" + this.children.map(child => child.toTreeRepr()).join(",\n").split("\n").map(line => "  " + line).join("\n") + "\n}";
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

    getImmediateChildrenAt(offset: number): SynNode | null {
        // Perform a binary search to find the child that contains the offset
        let left = 0;
        let right = this.children.length - 1;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const child = this.children[mid];
            const range = child.getTextRange();
            if (offset < range.start) {
                right = mid - 1;
            } else if (offset >= range.end) {
                left = mid + 1;
            } else {
                return child;
            }
        }
        if (left < this.children.length) {
            return this.children[left];
        }
        return null;
    }

    getDeepestChildAt(offset: number): SynNode | null {
        let child = this.getImmediateChildrenAt(offset);
        while (child && child instanceof AbstractSynParentElement) {
            const nextChild = child.getImmediateChildrenAt(offset);
            if (!nextChild) {
                break;
            }
            child = nextChild;  // assign regardless of whether it's a SynElement
        }
        return child;
    }

    getEnclosingOfType<T extends SynParentElement>(type: Class<T>): T | null {
        for (let parent = this.getParent(); parent !== null; parent = parent.getParent()) {
            if (parent instanceof type) {
                return parent;
            }
        }
        return null;
    }

    findFirstChildOfTypeAt<T extends SynParentElement>(type: Class<T>, offset: Offset): T | null {
        let childAtOffset = this.getImmediateChildrenAt(offset);
        if (childAtOffset && childAtOffset instanceof AbstractSynParentElement) {
            while (childAtOffset && childAtOffset instanceof AbstractSynParentElement && !(childAtOffset instanceof type)) {
                childAtOffset = childAtOffset.getImmediateChildrenAt(offset);
            }
            if (childAtOffset && childAtOffset instanceof AbstractSynParentElement && childAtOffset instanceof type) {
                return childAtOffset as T;
            }
        }
        return null;
    }

    getAllChildrenOfType<T extends SynNode>(type: Class<T>, nested: boolean = false): T[] {
        let result: T[] = [];
        for (let child of this.children) {
            if (child instanceof type) {
                result.push(child);
            }
            if (child instanceof AbstractSynParentElement && nested)
                result = result.concat(child.getAllChildrenOfType(type, true));
        }
        return result;
    }

    getAllToken(nested: boolean = false): SynTokenNode[] {
        let result: SynTokenNode[] = [];
        for (let child of this.children) {
            if (child instanceof SynTokenNode && !child.token.isCommentToken() && !child.token.shouldSkip()) {
                result.push(child);
            }
            if (child instanceof AbstractSynParentElement && nested)
                result = result.concat(child.getAllToken(true));
        }

        return result;
    }

    getNthChild(n: number): SynNode | null {
        let count = 0;
        for (const child of this.children) {
            if (child instanceof SynTokenNode && (child.token.isCommentToken() || child.token.shouldSkip())) continue;
            if (count === n) {
                return child;
            }
            count++;
        }

        return null;
    }

    getAllTokensOfType(type: TokenType, nested: boolean = false): SynTokenNode[] {
        let result: SynTokenNode[] = [];
        for (let child of this.children) {
            if (child instanceof SynTokenNode && child.token.isType(type)) {
                result.push(child);
            }
            if (child instanceof AbstractSynParentElement && nested)
                result = result.concat(child.getAllTokensOfType(type, true));
        }
        return result;
    }

    getNthChildOfType<T extends SynNode>(type: Class<T>, n: number): T | undefined {
        return this.getAllChildrenOfType(type)[n];
    }

    isSynthetic(): boolean {
        return this.synthetic;
    }

    accept(visitor: SynNodeVisitor): void {
        if (!visitor.isRecursive()) return;
        for (const child of this.children) {
            child.accept(visitor);
        }
    }

    setSynthetic() {
        this.synthetic = true;
    }

    _setParent(parent: SynParentElement): void {
        this.parent = parent;
    }

    getParent(): SynParentElement | null {
        return this.parent;
    }
}
