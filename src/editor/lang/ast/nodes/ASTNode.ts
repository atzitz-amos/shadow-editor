import {ASTType} from "../ASTGrammar";
import {TextRange} from "../../../core/coordinate/TextRange";

export interface ASTNode {
    getType(): ASTType;

    getChildren(): ASTNode[];

    getTextRange(): TextRange;
}