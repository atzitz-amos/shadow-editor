import {TextRange} from "../../../../editor/core/coordinate/range/TextRange";
import {Token} from "../builder/tokens/Token";
import {ASTGrammar, ASTType} from "../builder/parser/nodes/ASTGrammar";
import {SynNode} from "../api/SynNode";
import {SynElement} from "../api/SynElement";
import {SynFile} from "../api/SynFile";
import {EditorURI} from "../../../uri/EditorURI";
import {SynNodeVisitor} from "../visitors/SynNodeVisitor";

export class SynTokenNode implements SynNode {
    private parent: SynElement | null = null;

    constructor(public token: Token, public file: SynFile) {
    }

    getURI(): EditorURI {
        return this.file.getURI().selectedRegion(this.getTextRange());
    }

    getSynFile(): SynFile {
        return this.file;
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

    previousSibling(): SynNode | null {
        if (!this.parent) return null;

        const siblings = this.parent.getChildren();
        const index = siblings.indexOf(this);
        if (index <= 0) return null;

        return siblings[index - 1];
    }

    getTextRange(): TextRange {
        return this.token.getRange();
    }

    isSynElement(): this is SynElement {
        return false;
    }

    _setParent(parent: SynElement): void {
        this.parent = parent;
    }

    getParent(): SynElement | null {
        return this.parent;
    }

    accept(visitor: SynNodeVisitor): void {
        visitor.visitToken(this);
    }
}