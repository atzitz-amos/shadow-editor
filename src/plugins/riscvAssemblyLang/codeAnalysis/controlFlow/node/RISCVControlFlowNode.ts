import {SynASTElement} from "../../../../../lang/syntax/api/tree/SynASTElement";
import {DataFlowAnnotationStore} from "../../dataFlow/DataFlowAnnotationStore";

/**
 *
 * @author Atzitz Amos
 * @date 10/7/2026
 * @since 1.0.0
 */
export class RISCVControlFlowNode {

    private readonly store: DataFlowAnnotationStore = new DataFlowAnnotationStore(this);

    constructor(private readonly nodes: SynASTElement[]) {

    }

    getNodes(): SynASTElement[] {
        return this.nodes
    }

    getDataFlowStore() {
        return this.store;
    }
}
