import {SynElement} from "./SynElement";
import {SynDeclaration} from "../impl/SynDeclaration";

/**
 *
 * @author Atzitz Amos
 * @date 12/4/2025
 * @since 1.0.0
 */
export interface SynSymbol extends SynElement {
    getName(): string;

    resolve(): SynDeclaration | null;
}
