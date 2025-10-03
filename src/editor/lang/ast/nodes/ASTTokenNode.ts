import {TextRange} from "../../../core/coordinate/TextRange";
import {Token} from "../../tokens/Token";
import {ASTGrammar, ASTType} from "../ASTGrammar";
import {ASTNode} from "./ASTNode";

export class ASTTokenNode implements ASTNode {
    constructor(public token: Token) {
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