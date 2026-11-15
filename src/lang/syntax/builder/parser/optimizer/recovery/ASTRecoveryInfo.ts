import {TextRange} from "../../../../../../core/text/range/TextRange";
import {ASTCheckpoint} from "./ASTCheckpoint";

/**
 *
 * @author Atzitz Amos
 * @date 8/2/2026
 * @since 1.0.0
 */
export class ASTRecoveryInfo {
    /**
     * @param checkpoints checkpoints of the parse of the text right before this edit
     * @param textOffset start of the edit
     * @param textDelta inserted length minus replaced length
     * @param replacedLength length of the text the edit removed, in old coordinates
     * @param lexerInvalidRange range of re-lexed tokens, in new coordinates
     */
    constructor(public readonly checkpoints: ASTCheckpoint[],
                public readonly textOffset: Offset,
                public readonly textDelta: number,
                public readonly replacedLength: number,
                public readonly lexerInvalidRange: TextRange) {
    }

}
