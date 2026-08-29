import {SynScope} from "./SynScope";
import {SynScopeType} from "./SynScopeType";
import {SynCodeBlock} from "../../syntax/api/SynCodeBlock";

/**
 *
 * @author Atzitz Amos
 * @date 8/28/2026
 * @since 1.0.0
 */
export class SynLocalScope extends SynScope {
    constructor(private readonly scopeType: SynScopeType, codeblock: SynCodeBlock, parentScope: SynScope) {
        super(codeblock);
        this.makeAvailable(parentScope);
    }

    getScopeType(): SynScopeType {
        return this.scopeType;
    }
}
