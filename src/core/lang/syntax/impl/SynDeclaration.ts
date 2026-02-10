import {SynElementImpl} from "./SynElementImpl";
import {EditorURI} from "../../../project/uri/EditorURI";
import {URITargetType} from "../../../project/uri/URITargetType";

/**
 *
 * @author Atzitz Amos
 * @date 12/17/2025
 * @since 1.0.0
 */
export abstract class SynDeclaration extends SynElementImpl {
    abstract getName(): string;

    getURI(): EditorURI {
        return this.getParentScope().getURI().extendAnchor(this.getName(), URITargetType.SYMBOL);
    }
}
