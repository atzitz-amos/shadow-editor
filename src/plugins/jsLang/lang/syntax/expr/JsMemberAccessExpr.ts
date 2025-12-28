import {SynElementImpl} from "../../../../../core/lang/syntax/impl/SynElementImpl";
import {ASTNode} from "../../../../../core/lang/syntax/builder/parser/nodes/ASTNode";

/**
 *
 * @author Atzitz Amos
 * @date 11/27/2025
 * @since 1.0.0
 */
export class JsMemberAccessExpr extends SynElementImpl {
    constructor(node: ASTNode) {
        super(node);
    }
}
