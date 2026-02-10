import {TextRange} from "../../../../editor/core/coordinate/TextRange";
import {Token} from "../builder/tokens/Token";
import {ASTGrammar, ASTType} from "../builder/parser/nodes/ASTGrammar";
import {SynNode} from "../api/SynNode";
import {SynElement} from "../api/SynElement";
import {SynFile} from "../api/SynFile";
import {EditorURI} from "../../../project/uri/EditorURI";

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

    getChildren(): SynNode[] {
        return [];
    }

    getTextRange(): TextRange {
        return this.token.getRange();
    }

    isSynElement(): boolean {
        return false;
    }

    _setParent(parent: SynElement): void {
        this.parent = parent;
    }

    getParent(): SynElement | null {
        return this.parent;
    }
}