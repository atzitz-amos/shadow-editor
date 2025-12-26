import {SynCodeBlock} from "../../../../core/lang/builder/syntax/api/SynCodeBlock";
import {ASTNode} from "../../../../core/lang/builder/parser/nodes/ASTNode";

/**
 *
 * @author Atzitz Amos
 * @date 11/23/2025
 * @since 1.0.0
 */
export class JsCodeBlock extends SynCodeBlock {
    constructor(node: ASTNode) {
        super(node);
    }
}
