import {SynScope} from "./SynScope";
import {SynScopeType} from "./SynScopeType";

/**
 *
 * @author Atzitz Amos
 * @date 8/28/2026
 * @since 1.0.0
 */
export class SynGlobalScope extends SynScope {
    getScopeType(): SynScopeType {
        return SynScopeType.GLOBAL;
    }
}
