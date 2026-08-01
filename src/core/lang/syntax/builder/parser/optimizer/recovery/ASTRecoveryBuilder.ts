import {ASTBuilder} from "../../builder/ASTBuilder";
import {SynNode} from "../../../../api/SynNode";
import {SynDocument} from "../../../../api/document/SynDocument";
import {LanguageBase} from "../../../../../LanguageBase";
import {KillSignal} from "../../../../../../utils/KillSignal";
import {ASTCheckpoint} from "./ASTCheckpoint";
import {SynChildrenIterator} from "../../../../visitors/SynChildrenIterator";

/**
 *
 * @author Atzitz Amos
 * @date 7/29/2026
 * @since 1.0.0
 */
export class ASTRecoveryBuilder extends ASTBuilder {
    private checkpoints: ASTCheckpoint[];

    constructor(document: SynDocument, savedCheckpoints: ASTCheckpoint[], language: LanguageBase, signal: KillSignal) {
        super(document, language, signal);

        this.checkpoints = savedCheckpoints;
    }

    copyIntoProduction(node: SynNode, rangeDelta: number = 0) {
        this.production.push(node);
        this.stream.jumpN(node.getTokenCount())
    }
}
