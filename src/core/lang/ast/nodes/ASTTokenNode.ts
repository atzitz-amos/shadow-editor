import {TextRange} from "../../../../editor/core/coordinate/TextRange";
import {Token} from "../../tokens/Token";
import {ASTGrammar, ASTType} from "../ASTGrammar";
import {ASTNode} from "./ASTNode";

export class ASTTokenNode implements ASTNode {
    private range: TextRange | null = null;

    constructor(public token: Token) {
        let r = token.getRange()
        this.range = new TextRange(r.start, r.end);
    }

    getType(): ASTType {
        return ASTGrammar.TOKEN;
    }

    getChildren(): ASTNode[] {
        return [];
    }

    getTextRange(): TextRange {
        return this.token.getRange();
    }
}