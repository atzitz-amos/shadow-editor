import {SynElement} from "../api/SynElement";
import {SynNode} from "../api/SynNode";
import {TextRange} from "../../../../../editor/core/coordinate/TextRange";
import {ASTNode} from "../../parser/nodes/ASTNode";
import {SynScope} from "../../parser/scopes/SynScope";
import {SynFile} from "../api/SynFile";
import {EditorURI} from "../../../../project/uri/EditorURI";

/**
 * Provides a lot of standard functionality for syntax elements.
 *
 * @author Atzitz Amos
 * @date 11/25/2025
 * @since 1.0.0
 */
export abstract class SynElementImpl implements SynElement {
    protected readonly scope: SynScope;
    private readonly elementChildren: SynElement[];
    private readonly range: TextRange;
    private readonly children: SynNode[];
    private parent: SynElement | null = null;
    private readonly file: SynFile;

    protected constructor(node: ASTNode) {
        this.range = node.range;
        this.children = node.children;
        this.scope = node.scope;
        this.file = node.file;

        this.elementChildren = this.children.filter(child => child.isSynElement()) as SynElement[];

        for (const child of this.children) {
            child._setParent(this);
        }
    }

    public static builder<T extends SynElementImpl>(this: new (node: ASTNode) => T): (node: ASTNode) => T {
        return (node: ASTNode) => new this(node);
    }

    getURI(): EditorURI {
        return this.file.getURI().selectedRegion(this.range);
    }

    * childrenIterator(filter: (element: SynElement) => boolean): Iterable<SynElement> {
        for (const child of this.children) {
            if (child.isSynElement() && filter(child as SynElement)) {
                yield child as SynElement;
            }
        }
    }

    findChildrenAt(offset: number): SynNode | null {
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

    findEnclosingOfType<T extends SynElement>(type: Class<T>): T | null {
        for (let parent = this.getParent(); parent !== null; parent = parent.getParent()) {
            if (parent.isSynElement() && parent instanceof type) {
                return parent as T;
            }
        }
        return null;
    }

    findFirstChildOfType<T extends SynElement>(type: Class<T>, offset: Offset): T | null {
        let childAtOffset = this.findChildrenAt(offset);
        if (childAtOffset && childAtOffset.isSynElement()) {
            while (childAtOffset && childAtOffset.isSynElement() && !(childAtOffset instanceof type)) {
                childAtOffset = (childAtOffset as SynElement).findChildrenAt(offset);
            }
            if (childAtOffset && childAtOffset.isSynElement() && childAtOffset instanceof type) {
                return childAtOffset as T;
            }
        }
        return null;
    }

    findAllChildrenOfType<T extends SynElement>(type: Class<T>): T[] {
        let result: T[] = [];
        for (let child of this.children) {
            if (child instanceof type) {
                result.push(child);
            }
            if (child instanceof SynElementImpl)
                result = result.concat(child.findAllChildrenOfType(type));
        }
        return result;
    }

    getSynFile(): SynFile {
        return this.file;
    }

    getParentScope(): SynScope {
        return this.scope;
    }

    getElementChildren(): SynElement[] {
        return this.elementChildren;
    }

    getChildren(): SynNode[] {
        return this.children;
    }

    getParent(): SynElement | null {
        return this.parent;
    }

    getTextRange(): TextRange {
        return this.range;
    }

    isSynElement(): boolean {
        return true;
    }

    _setParent(parent: SynElement): void {
        this.parent = parent;
    }

}


