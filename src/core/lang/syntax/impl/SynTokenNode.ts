import {TextRange} from "../../../../editor/core/coordinate/range/TextRange";
import {Token} from "../builder/tokens/Token";
import {ASTGrammar, ASTType} from "../builder/parser/nodes/ASTGrammar";
import {SynNode} from "../api/SynNode";
import {SynASTElement} from "../api/tree/SynASTElement";
import {EditorURI} from "../../../uri/EditorURI";
import {SynNodeVisitor} from "../utils/visitors/SynNodeVisitor";
import {SynDocument} from "../api/document/SynDocument";
import {SynParentElement} from "../api/tree/SynParentElement";
import {SynLeafElement} from "../api/tree/SynLeafElement";
import {SynScope} from "../api/scope/SynScope";

export class SynTokenNode implements SynNode, SynLeafElement {
    private parent: SynParentElement | null = null;

    constructor(public token: Token, public document: SynDocument) {
    }

    getURI(): EditorURI {
        return this.document.getURI().selectedRegion(this.getTextRange());
    }

    getSynDocument(): SynDocument {
        return this.document;
    }

    getType(): ASTType {
        return ASTGrammar.TOKEN;
    }

    getValue(): string {
        return this.token.getValue();
    }

    toDebugString(): string {
        return `(${this.token.getValue()})`;
    }

    toTreeRepr(): string {
        return `Token('${this.token.getValue()}')`;
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

    getTextRange(): TextRange {
        return this.token.getRange();
    }

    isSynElement(): this is SynASTElement {
        return false;
    }

    _setParent(parent: SynParentElement): void {
        this.parent = parent;
    }

    previousSibling(): SynNode | null {
        if (!this.parent) return null;

        const siblings = this.parent.getChildren();
        const index = siblings.indexOf(this);
        if (index <= 0) return null;

        return siblings[index - 1];
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
        visitor.visitToken(this);
    }
}