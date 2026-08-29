import {SynASTElementImpl} from "../tree/SynASTElementImpl";
import {EditorURI} from "../../../../core/uri/EditorURI";
import {SynNodeVisitor} from "../../visitors/SynNodeVisitor";

/**
 *
 * @author Atzitz Amos
 * @date 12/17/2025
 * @since 1.0.0
 */
export abstract class SynNamedElement extends SynASTElementImpl {
    abstract getName(): string;

    getURI(): EditorURI {
        return null as unknown as EditorURI; // TODO
    }

    accept(visitor: SynNodeVisitor) {
        visitor.visitNamedElement(this);
        super.accept(visitor);
    }
}
