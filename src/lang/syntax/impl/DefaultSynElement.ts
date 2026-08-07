import {SynASTElementImpl} from "./tree/SynASTElementImpl";
import {ASTNode} from "../builder/parser/nodes/ASTNode";

/**
 *
 * @author Atzitz Amos
 * @date 11/25/2025
 * @since 1.0.0
 */
export class DefaultSynElement extends SynASTElementImpl {
    constructor(protected node: ASTNode) {
        super(node);
    }
}
