import {SynParentElement} from "./SynParentElement";
import {LanguageBase} from "../../../LanguageBase";
import {SynGlobalScope} from "../../../indexes/scope/SynGlobalScope";

/**
 * Represents a syntax tree in the language processing system. It acts as the root node of possibly multiple nodes.
 * However, it is recommended that parsers always wrap their output in a single codeblock.
 *
 * @author Atzitz Amos
 * @date 6/29/2026
 * @since 1.0.0
 */
export interface SynTree extends SynParentElement {
    getLanguage(): LanguageBase;

    getGlobalScope(): SynGlobalScope;
}
