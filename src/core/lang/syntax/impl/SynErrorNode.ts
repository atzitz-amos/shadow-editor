import {TextRange} from "../../../../editor/core/coordinate/range/TextRange";
import {ASTGrammar, ASTType} from "../builder/parser/nodes/ASTGrammar";
import {SynNode} from "../api/SynNode";
import {SynElement} from "../api/SynElement";
import {SynFile} from "../api/SynFile";
import {EditorURI} from "../../../uri/EditorURI";
import {URITargetType} from "../../../uri/URITargetType";
import {SynNodeVisitor} from "../visitors/SynNodeVisitor";


export class SynErrorNode implements SynNode {
    private parent: SynElement | null = null;

    constructor(private range: TextRange, private message: string, private file: SynFile) {
    }

    getURI(): EditorURI {
        return this.file.getURI().selectedRegion(this.range, URITargetType.ERROR);
    }

    getSynFile(): SynFile {
        return this.file;
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

    isSynElement(): this is SynElement {
        return false;
    }

    _setParent(parent: SynElement): void {
        this.parent = parent;
    }

    getParent(): SynElement | null {
        return this.parent;
    }

    isSynthetic(): boolean {
        return false;
    }

    accept(visitor: SynNodeVisitor): void {
        visitor.visitError(this);
    }
}