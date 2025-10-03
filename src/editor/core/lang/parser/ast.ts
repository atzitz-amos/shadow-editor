import {TextRange} from "../../coordinate/TextRange";
import {Token} from "../../../lang/tokens/Token";

/**
 * Represents a node in the Abstract Syntax Tree (AST).
 */
export interface SRNode {
    range: TextRange;
    language?: string;
    parent: SRNode | null;

    nodeType: string;

    isWellFormed(): boolean;

    getAllNodeChildren(): SRNode[];

    getNodeContent(): (Token | SRNode)[];
}

/**
 * A node that has children in the AST.
 */
export interface SRCodeBlock extends SRNode {
    range: TextRange;
    children: SRNode[];
}


export interface SRErrorNode extends SRNode {
    type: string;
    value: string;
}