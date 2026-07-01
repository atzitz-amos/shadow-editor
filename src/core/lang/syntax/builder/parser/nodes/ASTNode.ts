import {ASTType} from "./ASTGrammar";
import {TextRange} from "../../../../../../editor/core/coordinate/range/TextRange";
import {SynNode} from "../../../api/SynNode";
import {SynDocument} from "../../../api/document/SynDocument";
import {SynScope} from "../../../api/scope/SynScope";

export class ASTNode {
    constructor(public type: ASTType, public document: SynDocument, public children: SynNode[], public range: TextRange, public scope: SynScope) {
    }
}