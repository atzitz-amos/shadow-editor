import {SynElementImpl} from "../../../../../core/lang/builder/syntax/impl/SynElementImpl";
import {ASTNode} from "../../../../../core/lang/builder/parser/nodes/ASTNode";

/**
 *
 * @author Atzitz Amos
 * @date 11/23/2025
 * @since 1.0.0
 */
export class JsBinaryExpr extends SynElementImpl {
    constructor(node: ASTNode) {
        super(node);
        // left op right
        console.log("Binary: ", node);
    }
}
