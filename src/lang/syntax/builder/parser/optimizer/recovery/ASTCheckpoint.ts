import {SynASTElement} from "../../../../api/tree/SynASTElement";
import {TextRange} from "../../../../../../editor/core/coordinate/range/TextRange";

/**
 *
 * @author Atzitz Amos
 * @date 8/1/2026
 * @since 1.0.0
 */
export class ASTCheckpoint {
    private node: SynASTElement;

    constructor(private readonly name: string, private readonly contextFingerprint: any[]) {
    }

    getAdjustedRange(delta: number): TextRange {
        return this.node.getTextRange().shiftedBy(delta);
    }

    contextMatches(context: any[]) {
        return context.every((value, index) => value === this.contextFingerprint[index]);
    }

    getName(): string {
        return this.name;
    }

    getNode(): SynASTElement {
        return this.node;
    }

    getOffset(): Offset {
        return this.node.getTextRange().start;
    }

    complete(node: SynASTElement) {
        this.node = node;
    }
}
