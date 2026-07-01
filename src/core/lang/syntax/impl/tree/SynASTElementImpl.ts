import {SynASTElement} from "../../api/tree/SynASTElement";
import {TextRange} from "../../../../../editor/core/coordinate/range/TextRange";
import {ASTNode} from "../../builder/parser/nodes/ASTNode";
import {EditorURI} from "../../../../uri/EditorURI";
import {SynNodeVisitor} from "../../utils/visitors/SynNodeVisitor";
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

    private readonly range: TextRange;


    protected constructor(node: ASTNode) {
        super(node.children);
        this.node = node;
        this.range = node.range;
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
        return this.document.getURI().selectedRegion(this.range);
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
        return this.range;
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
}