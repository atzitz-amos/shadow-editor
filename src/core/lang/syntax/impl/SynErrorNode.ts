import {TextRange} from "../../../../editor/core/coordinate/range/TextRange";
import {ASTGrammar, ASTType} from "../builder/parser/nodes/ASTGrammar";
import {SynNode} from "../api/SynNode";
import {SynASTElement} from "../api/tree/SynASTElement";
import {EditorURI} from "../../../uri/EditorURI";
import {URITargetType} from "../../../uri/URITargetType";
import {SynNodeVisitor} from "../utils/visitors/SynNodeVisitor";
import {SynDocument} from "../api/document/SynDocument";
import {SynParentElement} from "../api/tree/SynParentElement";
import {SynLeafElement} from "../api/tree/SynLeafElement";
import {SynScope} from "../api/scope/SynScope";


export class SynErrorNode implements SynNode, SynLeafElement {
    private parent: SynParentElement | null = null;

    constructor(private range: TextRange, private message: string, private document: SynDocument) {
    }

    getURI(): EditorURI {
        return this.document.getURI().selectedRegion(this.range, URITargetType.ERROR);
    }

    getSynDocument(): SynDocument {
        return this.document;
    }

    getType(): ASTType {
        return ASTGrammar.SYNTAX_ERROR;
    }

    getChildren(): SynNode[] {
        return [];
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

    getTextRange(): TextRange {
        return this.range;
    }

    getErrorMessage(): string {
        return this.message;
    }

    toDebugString(): string {
        return `(ERROR ${this.message})`;
    }

    toTreeRepr(): string {
        return `#ERROR(${this.message})`;
    }

    isSynElement(): this is SynASTElement {
        return false;
    }

    _setParent(parent: SynParentElement): void {
        this.parent = parent;
    }

    getParent(): SynParentElement | null {
        return this.parent;
    }

    getParentScope(): SynScope {
        return this.parent!.getParentScope();
    }

    isSynthetic(): boolean {
        return false;
    }

    accept(visitor: SynNodeVisitor): void {
        visitor.visitError(this);
    }
}