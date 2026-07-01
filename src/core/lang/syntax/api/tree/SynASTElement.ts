import {SynParentElement} from "./SynParentElement";
import {ASTType} from "../../builder/parser/nodes/ASTGrammar";

export interface SynASTElement extends SynParentElement {
    getElementChildren(): SynASTElement[];

    findNthElementOfASTType(type: ASTType, n: number): SynParentElement | null;
}