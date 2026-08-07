import {SynParentElement} from "./SynParentElement";
import {ASTType} from "../../builder/parser/nodes/ASTGrammar";
import {ASTNode} from "../../builder/parser/nodes/ASTNode";

export interface SynASTElement extends SynParentElement {
    getRelativeOffset(): Offset;

    getTextLength(): number;

    getASTNode(): ASTNode;

    getElementChildren(): SynASTElement[];

    findNthElementOfASTType(type: ASTType, n: number): SynParentElement | null;
}