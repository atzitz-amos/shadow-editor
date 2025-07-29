import {TextRange} from "../../Position";

/**
 * Represents a node in the Abstract Syntax Tree (AST).
 */
export interface SRNode {
    range: TextRange;
    language?: string;
    parent: SRNode | null;

    isWellFormed(): boolean;

    getAllNodeChildren(): SRNode[];
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