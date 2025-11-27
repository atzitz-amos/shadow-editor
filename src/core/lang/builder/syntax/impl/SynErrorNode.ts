import {TextRange} from "../../../../../editor/core/coordinate/TextRange";
import {ASTGrammar, ASTType} from "../../parser/nodes/ASTGrammar";
import {SynNode} from "../api/SynNode";
import {SynElement} from "../api/SynElement";


export class SynErrorNode implements SynNode {
    private parent: SynElement | null = null;

    constructor(private range: TextRange, private message: string) {
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