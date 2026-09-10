import {TextRange} from "../../../editor/core/coordinate/range/TextRange";
import {ASTGrammar, ASTType} from "../builder/parser/nodes/ASTGrammar";
import {SynNode} from "../api/SynNode";
import {EditorURI} from "../../../core/uri/EditorURI";
import {URITargetType} from "../../../core/uri/URITargetType";
import {SynNodeVisitor} from "../visitors/SynNodeVisitor";
import {SynDocument} from "../api/document/SynDocument";
import {SynLeafElement} from "../api/tree/SynLeafElement";


export class SynErrorNode extends SynLeafElement implements SynNode {
    constructor(private range: TextRange, private message: string, document: SynDocument) {
        super(document)
    }

    getTokenCount(): number {
        return 0;
    }

    getURI(): EditorURI {
        return this.document.getURI().selectedRegion(this.range, URITargetType.ERROR);
    }

    getType(): ASTType {
        return ASTGrammar.SYNTAX_ERROR;
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

    accept(visitor: SynNodeVisitor): void {
        visitor.visitError(this);
    }
}