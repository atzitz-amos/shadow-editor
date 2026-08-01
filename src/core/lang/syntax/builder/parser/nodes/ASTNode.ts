import {ASTType} from "./ASTGrammar";
import {SynNode} from "../../../api/SynNode";
import {SynDocument} from "../../../api/document/SynDocument";
import {SynScope} from "../../../api/scope/SynScope";

export class ASTNode {
    private relativeOffset: Offset | null = null;
    private globalOffset: Offset | null = null;

    constructor(public type: ASTType,
                public document: SynDocument,
                public children: SynNode[],
                public textLength: number,
                public tokenCount: number,
                public scope: SynScope) {
    }

    getTokenCount() {
        return 0;
    }

    setRelativeOffset(offset: Offset) {
        this.relativeOffset = offset;
        this.globalOffset = null;
    }

    setGlobalOffset(offset: Offset) {
        this.relativeOffset = null;
        this.globalOffset = offset;
    }

    getRelativeOffset(): Offset | null {
        return this.relativeOffset;
    }

    getGlobalOffset(): Offset | null {
        return this.globalOffset;
    }


}