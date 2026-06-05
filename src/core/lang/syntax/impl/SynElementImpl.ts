import {SynElement} from "../api/SynElement";
import {SynNode} from "../api/SynNode";
import {TextRange} from "../../../../editor/core/coordinate/range/TextRange";
import {ASTNode} from "../builder/parser/nodes/ASTNode";
import {SynScope} from "../builder/parser/scopes/SynScope";
import {SynFile} from "../api/SynFile";
import {EditorURI} from "../../../uri/EditorURI";
import {SynNodeVisitor} from "../visitors/SynNodeVisitor";
import {ASTType} from "../builder/parser/nodes/ASTGrammar";
import {SynTokenNode} from "./SynTokenNode";
import {TokenType} from "../builder/tokens/TokenType";

/**
 * Provides a lot of standard functionality for syntax elements.
 *
 * @author Atzitz Amos
 * @date 11/25/2025
 * @since 1.0.0
 */
export abstract class SynElementImpl implements SynElement {
    protected readonly scope: SynScope;
    protected readonly node: ASTNode;
    private readonly elementChildren: SynElement[];
    private readonly range: TextRange;
    private readonly children: SynNode[];
    private parent: SynElement | null = null;
    private readonly file: SynFile;

    protected constructor(node: ASTNode) {
        this.node = node;
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
            if (child.isSynElement()) yield* (child as SynElement).childrenIterator(filter);
        }
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

    findDeepestChildAt(offset: number): SynNode | null {
        let child = this.findChildrenAt(offset);
        while (child && child.isSynElement()) {
            const nextChild = (child as SynElement).findChildrenAt(offset);
            if (!nextChild) {
                break;
            }
            child = nextChild;  // assign regardless of whether it's a SynElement
        }
        return child;
    }

    findEnclosingOfType<T extends SynElement>(type: Class<T>): T | null {
        for (let parent = this.getParent(); parent !== null; parent = parent.getParent()) {
            if (parent.isSynElement() && parent instanceof type) {
                return parent as T;
            }
        }
        return null;
    }

    findFirstChildOfTypeAt<T extends SynElement>(type: Class<T>, offset: Offset): T | null {
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

    findAllChildrenOfType<T extends SynNode>(type: Class<T>, nested: boolean = false): T[] {
        let result: T[] = [];
        for (let child of this.children) {
            if (child instanceof type) {
                result.push(child);
            }
            if (child instanceof SynElementImpl && nested)
                result = result.concat(child.findAllChildrenOfType(type, true));
        }
        return result;
    }

    getAllToken(nested: boolean = false): SynTokenNode[] {
        let result: SynTokenNode[] = [];
        for (let child of this.children) {
            if (child instanceof SynTokenNode && !child.token.isCommentToken() && !child.token.shouldSkip()) {
                result.push(child);
            }
            if (child instanceof SynElementImpl && nested)
                result = result.concat(child.getAllToken(true));
        }

        return result;
    }

    findNthChild(n: number): SynNode | null {
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

    findAllTokensOfType(type: TokenType, nested: boolean = false): SynTokenNode[] {
        let result: SynTokenNode[] = [];
        for (let child of this.children) {
            if (child instanceof SynTokenNode && child.token.isType(type)) {
                result.push(child);
            }
            if (child instanceof SynElementImpl && nested)
                result = result.concat(child.findAllTokensOfType(type, true));
        }
        return result;
    }

    findNthChildOfType<T extends SynNode>(type: Class<T>, n: number): T | undefined {
        return this.findAllChildrenOfType(type)[n];
    }

    findNthElementOfASTType(type: ASTType, n: number): SynElement | null {
        let count = 0;
        for (const child of this.elementChildren) {
            if (child instanceof SynElementImpl && child.node.type === type) {
                if (count === n) {
                    return child;
                }
                count++;
            }
        }

        return null;
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

    getChildren(withComments: boolean = true): SynNode[] {
        if (withComments) {
            return this.children;
        }
        return this.children.filter(child => !(child instanceof SynTokenNode) || (!child.token.isCommentToken() && !child.token.shouldSkip()));
    }

    getParent(): SynElement | null {
        return this.parent;
    }

    getTextRange(): TextRange {
        return this.range;
    }

    toDebugString(): string {
        const children = this.elementChildren.map(child => child.toDebugString()).join(" ");
        const typeName = this.node.type.debugName;
        return children.length > 0 ? `(${typeName} ${children})` : `(${typeName})`;
    }

    toTreeRepr(): string {
        return this.constructor.name + " {\n" + this.children.map(child => child.toTreeRepr()).join(",\n").split("\n").map(line => "  " + line).join("\n") + "\n}";
    }

    isSynElement(): this is SynElement {
        return true;
    }

    _setParent(parent: SynElement): void {
        this.parent = parent;
    }

    accept(visitor: SynNodeVisitor): void {
        visitor.visitElement(this);
    }
}


