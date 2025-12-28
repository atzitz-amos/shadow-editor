import {ASTType} from "./ASTGrammar";
import {TextRange} from "../../../../../../editor/core/coordinate/TextRange";
import {SynNode} from "../../../api/SynNode";
import {SynScope} from "../scopes/SynScope";
import {SynFile} from "../../../api/SynFile";

export class ASTNode {
    constructor(public type: ASTType, public file: SynFile, public children: SynNode[], public range: TextRange, public scope: SynScope) {
    }
}