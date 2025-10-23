import {TextRange} from "../../../core/coordinate/TextRange";
import {ASTGrammar, ASTType} from "../ASTGrammar";
import {ASTNode} from "./ASTNode";


export class ASTErrorNode implements ASTNode {
    constructor(private range: TextRange, private message: string) {
    }

    getType(): ASTType {
        return ASTGrammar.SYNTAX_ERROR;
    }

    getChildren(): ASTNode[] {
        return [];
    }

    getTextRange(): TextRange {
        return this.range;
    }

    getErrorMessage(): string {
        return this.message;
    }
}