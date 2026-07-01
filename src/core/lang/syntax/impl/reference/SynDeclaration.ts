import {SynASTElementImpl} from "../tree/SynASTElementImpl";
import {EditorURI} from "../../../../uri/EditorURI";
import {URITargetType} from "../../../../uri/URITargetType";

/**
 *
 * @author Atzitz Amos
 * @date 12/17/2025
 * @since 1.0.0
 */
export abstract class SynDeclaration extends SynASTElementImpl {
    abstract getName(): string;

    getURI(): EditorURI {
        return this.getParentScope().getURI().extendAnchor(this.getName(), URITargetType.SYMBOL);
    }
}
