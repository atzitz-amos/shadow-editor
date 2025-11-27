import {SynElementImpl} from "../../../../../core/lang/builder/syntax/impl/SynElementImpl";
import {ASTNode} from "../../../../../core/lang/builder/parser/nodes/ASTNode";

/**
 *
 * @author Atzitz Amos
 * @date 11/27/2025
 * @since 1.0.0
 */
export class JsArrayAccessExpr extends SynElementImpl {
    constructor(node: ASTNode) {
        super(node);
        console.log("ArrayAccess: ", node);
    }
}
