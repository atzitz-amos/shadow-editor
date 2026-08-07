import {ASTBuilder} from "../../builder/ASTBuilder";
import {SynDocument} from "../../../../api/document/SynDocument";
import {LanguageBase} from "../../../../../LanguageBase";
import {KillSignal} from "../../../../../../core/utils/KillSignal";
import {ASTCheckpoint} from "./ASTCheckpoint";
import {TextRange} from "../../../../../../editor/core/coordinate/range/TextRange";
import {ASTRecoveryInfo} from "./ASTRecoveryInfo";
import {SynNode} from "../../../../api/SynNode";


export type RecoveryStatistics = {
    recoveryMode: "recover" | "disabled",
    totalCodeblocksReused: number,
    totalCodeblocks: number,
    totalNodesReused: number,
    totalNodes: number,
    totalTextReused: number,
    totalTextLength: number
}

/**
 *
 * @author Atzitz Amos
 * @date 7/29/2026
 * @since 1.0.0
 */
export class ASTRecoveryBuilder extends ASTBuilder {
    private readonly currentCheckpoints: ASTCheckpoint[] = [];
    private savedCheckpoints: ASTCheckpoint[];
    private textOffset: Offset;
    private textDelta: number;
    private lexerInvalidRange: TextRange;

    private readonly codeblockReused: Set<SynNode> = new Set<SynNode>();

    private collectStatistics: boolean = false;

    constructor(document: SynDocument, language: LanguageBase, signal: KillSignal) {
        super(document, language, signal);
    }

    inRecoveryMode(): boolean {
        return this.savedCheckpoints !== undefined && this.lexerInvalidRange !== undefined;
    }

    setRecoveryMode(recoveryInfo: ASTRecoveryInfo) {
        this.savedCheckpoints = recoveryInfo.checkpoints;
        this.textOffset = recoveryInfo.textOffset;
        this.textDelta = recoveryInfo.textDelta;
        this.lexerInvalidRange = recoveryInfo.lexerInvalidRange;
    }

    pushCheckpoint(name: string, contextFingerprint: any[]): ASTCheckpoint {
        const checkpoint = new ASTCheckpoint(name, contextFingerprint);
        this.currentCheckpoints.push(checkpoint);
        return checkpoint;
    }

    getCheckpoints() {
        return this.currentCheckpoints;
    }

    getSavedCheckpoints() {
        return this.savedCheckpoints;
    }

    getEditTextOffset(): Offset {
        return this.textOffset;
    }

    getEditTextDelta(): number {
        return this.textDelta;
    }

    getLexerInvalidRange(): TextRange {
        return this.lexerInvalidRange;
    }

    copyIntoProduction(node: SynNode) {
        super.copyIntoProduction(node);

        if (this.collectStatistics) {
            this.codeblockReused.add(node);
        }
    }

    enableStatisticsCollection(): void {
        this.collectStatistics = true;
    }

    getStatistics(): RecoveryStatistics {
        if (!this.collectStatistics) throw new Error("Recovery statistics collection is disabled. Enable it by calling enableStatisticsCollection() before parsing.");

        const tree = this.getTree();

        const stats: RecoveryStatistics = {
            recoveryMode: this.inRecoveryMode() ? "recover" : "disabled",
            totalCodeblocksReused: this.codeblockReused.size,
            totalCodeblocks: this.currentCheckpoints.length,
            totalNodesReused: 0,
            totalNodes: 0,
            totalTextReused: 0,
            totalTextLength: tree.getTextRange().getLength()
        }

        this.collectNodeStats(tree, stats);

        return stats;
    }

    private collectNodeStats(node: SynNode, stats: RecoveryStatistics): void {
        stats.totalNodes += 1;

        if (this.codeblockReused.has(node)) {
            stats.totalNodesReused += this.countSubtreeNodes(node);
            stats.totalNodes += this.countSubtreeNodes(node);
            stats.totalTextReused += node.getTextRange().getLength();
            return;
        } else {
            for (const child of node.getChildren()) {
                this.collectNodeStats(child, stats);
            }
        }
    }

    private countSubtreeNodes(node: SynNode): number {
        let count = 1;
        for (const child of node.getChildren()) {
            count += this.countSubtreeNodes(child);
        }
        return count;
    }
}
