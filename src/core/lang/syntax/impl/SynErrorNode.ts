import {TextRange} from "../../../../editor/core/coordinate/TextRange";
import {ASTGrammar, ASTType} from "../builder/parser/nodes/ASTGrammar";
import {SynNode} from "../api/SynNode";
import {SynElement} from "../api/SynElement";
import {SynFile} from "../api/SynFile";
import {EditorURI} from "../../../uri/EditorURI";
import {URITargetType} from "../../../uri/URITargetType";


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

    getTextRange(): TextRange {
        return this.range;
    }

    getErrorMessage(): string {
        return this.message;
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
}