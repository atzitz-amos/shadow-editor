import {SynASTElement} from "../../../../api/tree/SynASTElement";

/**
 *
 * @author Atzitz Amos
 * @date 8/1/2026
 * @since 1.0.0
 */
export class ASTCheckpoint {
    private node: SynASTElement;

    // Frozen when the checkpoint completes: the node itself may be reused and moved by a later parse.
    private start: Offset;
    private end: Offset;

    private exitState: unknown[];
    private exitWasInvalid: boolean;
    private trailingTrivia: number;

    constructor(private readonly name: string, private readonly args: any[], private readonly entryState: unknown[]) {
    }

    // Omitted arguments take their defaults, so the argument lists must match in length too.
    private static sameValues(a: unknown[], b: unknown[]) {
        return a.length === b.length && a.every((value, index) => value === b[index]);
    }

    /**
     * Whether a call recorded by `other` would parse the same text exactly as this one did.
     */
    contextMatches(other: ASTCheckpoint) {
        return this.name === other.name
            && ASTCheckpoint.sameValues(this.args, other.args)
            && ASTCheckpoint.sameValues(this.entryState, other.entryState);
    }

    getName(): string {
        return this.name;
    }

    getNode(): SynASTElement {
        return this.node;
    }

    getOffset(): Offset {
        return this.start;
    }

    getEnd(): Offset {
        return this.end;
    }

    getExitState(): unknown[] {
        return this.exitState;
    }

    getExitWasInvalid(): boolean {
        return this.exitWasInvalid;
    }

    getTrailingTrivia(): number {
        return this.trailingTrivia;
    }

    isComplete(): boolean {
        return this.node !== undefined;
    }

    complete(node: SynASTElement, exitState: unknown[], exitWasInvalid: boolean, lastTokenOffset: Offset) {
        const range = node.getTextRange();
        this.node = node;
        this.start = range.start;
        this.end = range.end;
        this.exitState = exitState;
        this.exitWasInvalid = exitWasInvalid;
        this.trailingTrivia = range.end - lastTokenOffset;
    }
}
