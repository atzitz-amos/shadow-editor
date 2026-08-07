import {SynASTElementImpl} from "../../../../../lang/syntax/impl/tree/SynASTElementImpl";
import {ASTNode} from "../../../../../lang/syntax/builder/parser/nodes/ASTNode";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";

/**
 *
 * @author Atzitz Amos
 * @date 6/3/2026
 * @since 1.0.0
 */
export class JsFunctionParameters extends SynASTElementImpl {
    constructor(node: ASTNode) {
        super(node);
    }

    accept(visitor: SynNodeVisitor) {
        super.accept(visitor);
    }
}

export class JsFunctionParameter extends SynASTElementImpl {
    constructor(node: ASTNode) {
        super(node);
    }

    accept(visitor: SynNodeVisitor) {
        super.accept(visitor);
    }
}
