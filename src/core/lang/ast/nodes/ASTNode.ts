import {ASTType} from "../ASTGrammar";
import {TextRange} from "../../../../editor/core/coordinate/TextRange";

export interface ASTNode {
    getType(): ASTType;

    getChildren(): ASTNode[];

    getTextRange(): TextRange;
}