import {TextRange} from "../../../../../editor/core/coordinate/TextRange";
import {Token} from "../../tokens/Token";
import {ASTGrammar, ASTType} from "../../parser/nodes/ASTGrammar";
import {SynNode} from "../api/SynNode";
import {SynElement} from "../api/SynElement";

export class SynTokenNode implements SynNode {
    private parent: SynElement | null = null;

    constructor(public token: Token) {
    }

    getType(): ASTType {
        return ASTGrammar.TOKEN;
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