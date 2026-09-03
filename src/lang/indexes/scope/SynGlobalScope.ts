import {SynScope} from "./SynScope";
import {SynScopeType} from "./SynScopeType";
import {SynCodeBlock} from "../../syntax/api/SynCodeBlock";

/**
 *
 * @author Atzitz Amos
 * @date 8/28/2026
 * @since 1.0.0
 */
export class SynGlobalScope extends SynScope {
    constructor(associatedCodeblock: SynCodeBlock) {
        super(associatedCodeblock);
    }

    setAssociatedCodeblock(codeblock: SynCodeBlock) {
        this.associatedCodeblock = codeblock;
    }

    getScopeType(): SynScopeType {
        return SynScopeType.GLOBAL;
    }
}
