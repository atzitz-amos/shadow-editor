import {SynASTElementImpl} from "../tree/SynASTElementImpl";
import {SynNodeVisitor} from "../../visitors/SynNodeVisitor";

/**
 *
 * @author Atzitz Amos
 * @date 12/17/2025
 * @since 1.0.0
 */
export abstract class SynNamedElement extends SynASTElementImpl {
    abstract getName(): string;

    accept(visitor: SynNodeVisitor) {
        visitor.visitNamedElement(this);
        super.accept(visitor);
    }
}
