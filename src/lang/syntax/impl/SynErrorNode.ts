import {TextRange} from "../../../editor/core/coordinate/range/TextRange";
import {ASTGrammar, ASTType} from "../builder/parser/nodes/ASTGrammar";
import {SynNode} from "../api/SynNode";
import {EditorURI} from "../../../core/uri/EditorURI";
import {URITargetType} from "../../../core/uri/URITargetType";
import {SynNodeVisitor} from "../visitors/SynNodeVisitor";
import {SynDocument} from "../api/document/SynDocument";
import {SynLeafElement} from "../api/tree/SynLeafElement";


export class SynErrorNode extends SynLeafElement implements SynNode {
    private relativeStart: Offset | null = null;

    constructor(private range: TextRange, private message: string, document: SynDocument) {
        super(document)
    }

    /**
     * Anchors the error to its parent's start, so it moves along when the parent is reused by an incremental parse.
     */
    setRelativeTo(parentStart: Offset) {
        this.relativeStart = this.range.start - parentStart;
    }

    getTokenCount(): number {
        return 0;
    }

    getURI(): EditorURI {
        return this.document.getURI().selectedRegion(this.getTextRange(), URITargetType.ERROR);
    }

    getType(): ASTType {
        return ASTGrammar.SYNTAX_ERROR;
    }

    getTextRange(): TextRange {
        const parent = this.getParent();
        if (this.relativeStart === null || !parent) return this.range;

        const start = parent.getTextRange().start + this.relativeStart;
        return new TextRange(start, start + this.range.getLength());
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

    accept(visitor: SynNodeVisitor): void {
        visitor.visitError(this);
    }
}