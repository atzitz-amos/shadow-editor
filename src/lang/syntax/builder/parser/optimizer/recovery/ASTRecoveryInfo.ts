import {TextRange} from "../../../../../../editor/core/coordinate/range/TextRange";
import {ASTCheckpoint} from "./ASTCheckpoint";

/**
 *
 * @author Atzitz Amos
 * @date 8/2/2026
 * @since 1.0.0
 */
export class ASTRecoveryInfo {
    constructor(public readonly checkpoints: ASTCheckpoint[], public readonly textOffset: Offset, public readonly textDelta: number, public readonly lexerInvalidRange: TextRange) {
    }

}
