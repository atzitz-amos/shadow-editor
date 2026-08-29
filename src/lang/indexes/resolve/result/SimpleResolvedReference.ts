import {ResolvedReference} from "./ResolvedReference";
import {SynNamedElement} from "../../../syntax/impl/reference/SynNamedElement";

/**
 *
 * @author Atzitz Amos
 * @date 8/28/2026
 * @since 1.0.0
 */
export class SimpleResolvedReference extends ResolvedReference {
    constructor(private readonly node: SynNamedElement) {
        super();
    }

    getNode(): SynNamedElement {
        return this.node;
    }
}
