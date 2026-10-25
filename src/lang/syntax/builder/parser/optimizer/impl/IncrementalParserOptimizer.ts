import {ASTRecoveryBuilder} from "../recovery/ASTRecoveryBuilder";
import {ASTCheckpoint} from "../recovery/ASTCheckpoint";
import {SynASTElementImpl} from "../../../../impl/tree/SynASTElementImpl";
import {SynNode} from "../../../../api/SynNode";
import {StatefulSnapshot} from "../api/Stateful";
import {TextRange} from "../../../../../../editor/core/coordinate/range/TextRange";

/**
 *
 * @author Atzitz Amos
 * @date 7/30/2026
 * @since 1.0.0
 */
export class IncrementalParserOptimizer {
    private builder: ASTRecoveryBuilder;
    private checkpoints: ASTCheckpoint[] | undefined;
    private index: number;
    private state: StatefulSnapshot;

    private isValid: boolean;

    begin(cls: any, args: any[]): IncrementalParserOptimizer {
        this.builder = args[0];
        if (!(this.builder instanceof ASTRecoveryBuilder)) {
            this.isValid = false;
            return this;
        }

        this.isValid = true;
        this.state = new StatefulSnapshot(cls);
        this.checkpoints = this.builder.getSavedCheckpoints();
        this.index = 0;
        return this;
    }

    invoke(target: (...args: any[]) => void, cls: any, args: any[]) {
        if (!this.isValid) return target.apply(cls, args);
        const checkpoint = this.builder.pushCheckpoint(target.name, args, this.state.capture());

        const node = this.obtainNode(target, cls, args, checkpoint);
        if (!(node instanceof SynASTElementImpl)) {
            return;
        }
        checkpoint.complete(node, this.state.capture(), this.builder.wasInvalid(), this.builder.getLastTokenOffset());
    }

    private obtainNode(target: (...args: any[]) => void, cls: any, args: any[], current: ASTCheckpoint): SynNode {
        if (this.checkpoints) {
            const saved = this.advanceToCheckpoint(target.name);
            if (saved?.contextMatches(current) && this.isReusable(saved)) {
                const node = saved.getNode();

                node.getASTNode().setGlobalOffset(this.adjustedOffset(saved.getOffset()));
                this.builder.copyIntoProduction(node, saved.getExitWasInvalid(), saved.getTrailingTrivia());
                // Replay the side effects the skipped call would have had on the parser
                this.state.restore(saved.getExitState());
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
    private advanceToCheckpoint(name: string): ASTCheckpoint | null {
        while (this.index < this.checkpoints!.length) {
            const checkpoint = this.checkpoints![this.index];

            if (checkpoint.isComplete() && checkpoint.getName() === name) {
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

    /**
     * A node can be reused only if it neither overlaps the replaced text nor any re-lexed token.
     * Past the first check, the node lies entirely before or entirely after the edit, so mapping its bounds is exact.
     */
    private isReusable(checkpoint: ASTCheckpoint): boolean {
        const editStart = this.builder.getEditTextOffset();
        const editEnd = editStart + this.builder.getEditReplacedLength();
        if (checkpoint.getOffset() <= editEnd && checkpoint.getEnd() >= editStart) return false;

        const range = new TextRange(this.adjustedOffset(checkpoint.getOffset()), this.adjustedOffset(checkpoint.getEnd()));
        return !this.builder.getLexerInvalidRange().intersects(range);
    }

    private adjustedOffset(offset: Offset) {
        if (offset >= this.builder.getEditTextOffset()) {
            return offset + this.builder.getEditTextDelta();
        }
        return offset;
    }
}
