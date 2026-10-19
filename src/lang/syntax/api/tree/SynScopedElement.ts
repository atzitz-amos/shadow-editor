import {SynScope} from "../../../indexes/scope/SynScope";

/**
 *
 * @author Atzitz Amos
 * @date 10/1/2026
 * @since 1.0.0
 */
export interface SynScopedElement {
    getAssociatedScope(): SynScope | null;
}
