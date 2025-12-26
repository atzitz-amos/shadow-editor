import {SynElementImpl} from "../impl/SynElementImpl";
import {ASTNode} from "../../parser/nodes/ASTNode";
import {SynScope} from "../../parser/scopes/SynScope";

/**
 *
 * @author Atzitz Amos
 * @date 11/23/2025
 * @since 1.0.0
 */
export abstract class SynCodeBlock extends SynElementImpl {
    protected constructor(node: ASTNode) {
        super(node);
    }

    getParentScope(): SynScope {
        return this.scope.getParent();
    }

    getAssociatedScope(): SynScope {
        return this.scope;
    }
}
