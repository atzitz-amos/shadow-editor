import {SynElementImpl} from "./SynElementImpl";
import {ASTNode} from "../builder/parser/nodes/ASTNode";

/**
 *
 * @author Atzitz Amos
 * @date 11/25/2025
 * @since 1.0.0
 */
export class DefaultSynElement extends SynElementImpl {
    constructor(private node: ASTNode) {
        super(node);
    }
}
