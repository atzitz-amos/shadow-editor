import {TextRange} from "../../../core/coordinate/TextRange";
import {ASTType} from "../ASTGrammar";
import {ASTNode} from "./ASTNode";


export class ASTElementNode implements ASTNode {
    constructor(private type: ASTType, private children: ASTNode[], private range: TextRange) {
    }

    getType(): ASTType {
        return this.type;
    }

    getChildren(): ASTNode[] {
        return this.children;
    }

    getTextRange(): TextRange {
        return this.range;
    }

}