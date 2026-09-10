import {TextRange} from "../../../editor/core/coordinate/range/TextRange";
import {Token} from "../builder/tokens/Token";
import {ASTGrammar, ASTType} from "../builder/parser/nodes/ASTGrammar";
import {SynNode} from "../api/SynNode";
import {EditorURI} from "../../../core/uri/EditorURI";
import {SynNodeVisitor} from "../visitors/SynNodeVisitor";
import {SynDocument} from "../api/document/SynDocument";
import {SynLeafElement} from "../api/tree/SynLeafElement";

export class SynTokenNode extends SynLeafElement implements SynNode {

    constructor(public token: Token, document: SynDocument) {
        super(document);
    }

    getTokenCount(): number {
        return 1;
    }

    getURI(): EditorURI {
        return this.document.getURI().selectedRegion(this.getTextRange());
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

    getTextRange(): TextRange {
        return this.token.getRange();
    }

    accept(visitor: SynNodeVisitor): void {
        visitor.visitToken(this);
    }

    getTokenType() {
        return this.token.getType();
    }
}