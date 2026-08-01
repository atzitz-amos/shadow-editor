import {SynASTElement} from "../../api/tree/SynASTElement";
import {TextRange} from "../../../../../editor/core/coordinate/range/TextRange";
import {ASTNode} from "../../builder/parser/nodes/ASTNode";
import {EditorURI} from "../../../../uri/EditorURI";
import {SynNodeVisitor} from "../../visitors/SynNodeVisitor";
import {ASTType} from "../../builder/parser/nodes/ASTGrammar";
import {SynDocument} from "../../api/document/SynDocument";
import {SynScope} from "../../api/scope/SynScope";
import {AbstractSynParentElement} from "./AbstractSynParentElement";

/**
 * Provides a lot of standard functionality for syntax elements.
 *
 * @author Atzitz Amos
 * @date 11/25/2025
 * @since 1.0.0
 */
export abstract class SynASTElementImpl extends AbstractSynParentElement implements SynASTElement {
    protected readonly node: ASTNode;

    protected readonly document: SynDocument;
    protected readonly scope: SynScope;

    private readonly elementChildren: SynASTElement[];

    protected constructor(node: ASTNode) {
        super(node.children);
        this.node = node;
        this.scope = node.scope;
        this.document = node.document;

        this.elementChildren = this.children.filter(child => child instanceof SynASTElementImpl) as SynASTElement[];

        for (const child of this.children) {
            child._setParent(this);
        }
    }

    public static builder<T extends SynASTElementImpl>(this: new (node: ASTNode) => T): (node: ASTNode) => T {
        return (node: ASTNode) => new this(node);
    }

    getURI(): EditorURI {
        return this.document.getURI().selectedRegion(this.getTextRange());
    }

    getSynDocument(): SynDocument {
        return this.document;
    }

    getParentScope(): SynScope {
        return this.scope;
    }

    findNthElementOfASTType(type: ASTType, n: number): SynASTElement | null {
        let count = 0;
        for (const child of this.elementChildren) {
            if (child instanceof SynASTElementImpl && child.node.type === type) {
                if (count === n) {
                    return child;
                }
                count++;
            }
        }

        return null;
    }

    getElementChildren(): SynASTElement[] {
        return this.elementChildren;
    }

    getTextRange(): TextRange {
        let start: number | null;
        if (this.node.getRelativeOffset() !== null) {
            const parentStart = this.getParent() !== null ? this.getParent()!.getTextRange().start : 0;
            start = parentStart + this.node.getRelativeOffset()!;
        } else {
            start = this.node.getGlobalOffset();
        }

        if (!start) start = 0;
        return new TextRange(start, start + this.node.textLength);
    }

    getTokenCount(): number {
        return this.node.getTokenCount();
    }

    toDebugString(): string {
        const children = this.elementChildren.map(child => child.toDebugString()).join(" ");
        const typeName = this.node.type.debugName;
        return children.length > 0 ? `(${typeName} ${children})` : `(${typeName})`;
    }

    accept(visitor: SynNodeVisitor): void {
        visitor.visitElement(this);

        super.accept(visitor);
    }

    getASTNode(): ASTNode {
        return this.node;
    }
}