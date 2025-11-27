import {ASTType} from "./ASTGrammar";
import {TextRange} from "../../../../../editor/core/coordinate/TextRange";
import {SynNode} from "../../syntax/api/SynNode";

export class ASTNode {
    constructor(public type: ASTType, public children: SynNode[], public range: TextRange) {
    }
}