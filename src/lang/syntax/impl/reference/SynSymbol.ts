import {SynASTElement} from "../../api/tree/SynASTElement";
import {SynDeclaration} from "./SynDeclaration";

/**
 *
 * @author Atzitz Amos
 * @date 12/4/2025
 * @since 1.0.0
 */
export interface SynSymbol extends SynASTElement {
    getName(): string;

    resolve(): SynDeclaration | null;
}
