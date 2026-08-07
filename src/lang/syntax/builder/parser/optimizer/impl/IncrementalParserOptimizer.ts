import {ASTRecoveryBuilder} from "../recovery/ASTRecoveryBuilder";
import {ASTCheckpoint} from "../recovery/ASTCheckpoint";
import {SynASTElementImpl} from "../../../../impl/tree/SynASTElementImpl";
import {SynNode} from "../../../../api/SynNode";
import {SynASTElement} from "../../../../api/tree/SynASTElement";

/**
 *
 * @author Atzitz Amos
 * @date 7/30/2026
 * @since 1.0.0
 */
export class IncrementalParserOptimizer {
    private builder: ASTRecoveryBuilder;
    private checkpoints: ASTCheckpoint[];
    private index: number;

    private isValid: boolean;

    constructor(private readonly target: Constructor, private readonly statefulFields: string[]) {
    }

    begin(cls: any, args: any[]): IncrementalParserOptimizer {
        this.builder = args[0];
        if (!(this.builder instanceof ASTRecoveryBuilder))
            this.isValid = false;

        if (!this.builder.inRecoveryMode()) {
            this.isValid = false;
        } else {
            this.isValid = true;
            this.checkpoints = this.builder.getSavedCheckpoints();
            this.index = 0;
        }
        return this;
    }

    invoke(target: (...args: any[]) => void, cls: any, args: any[]) {
        const checkpoint = this.builder.pushCheckpoint(target.name, args);

        const node = this.obtainNode(target, cls, args);
        if (!(node instanceof SynASTElementImpl)) {
            return;
        }
        checkpoint.complete(node)
    }

    private obtainNode(target: (...args: any[]) => void, cls: any, args: any[]): SynNode {
        if (this.isValid) {
            const checkpoint = this.advanceToCheckpoint(target.name, cls, args);
            if (checkpoint?.contextMatches(args)
                && !this.builder.getLexerInvalidRange().intersects(checkpoint.getAdjustedRange(this.builder.getEditTextDelta()))) {
                const node = checkpoint.getNode();

                node.getASTNode().setGlobalOffset(this.adjustedOffset(checkpoint.getOffset()));
                this.advanceBuilder(node);
                return node;
            }
        }

        target.apply(cls, args);
        const production = this.builder.getProduction();
        return production[production.length - 1];
    }

    /**
     * Advances to next
     */
    private advanceToCheckpoint(name: string, cls: any, args: any[]): ASTCheckpoint | null {
        while (this.index < this.checkpoints.length) {
            const checkpoint = this.checkpoints[this.index];

            if (checkpoint.getName() === name) {
                const checkpointOffset = this.adjustedOffset(checkpoint.getOffset());
                const textOffset = this.builder.getTextOffset();
                if (checkpointOffset === textOffset) {
                    this.index++;
                    return checkpoint;
                } else if (checkpointOffset > textOffset) {
                    break;
                }
            }

            this.index++;
        }

        return null;
    }

    private adjustedOffset(offset: Offset) {
        if (offset >= this.builder.getEditTextOffset()) {
            return offset + this.builder.getEditTextDelta();
        }
        return offset;
    }

    private advanceBuilder(node: SynASTElement) {
        this.builder.copyIntoProduction(node);
    }
}
