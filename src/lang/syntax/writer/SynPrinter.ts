import {SynNode} from "../api/SynNode";

/**
 *
 * @author Atzitz Amos
 * @date 6/6/2026
 * @since 1.0.0
 */
export interface SynPrinter {
    print(node: SynNode): string;
}
