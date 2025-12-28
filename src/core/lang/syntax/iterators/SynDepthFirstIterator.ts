import {SynNode} from "../api/SynNode";

/**
 *
 * @author Atzitz Amos
 * @date 11/25/2025
 * @since 1.0.0
 */
export function SynDepthFirstIterator(node: SynNode) {
    return {
        * [Symbol.iterator]() {
            yield node;
            for (const child of node.getChildren()) {
                yield* SynDepthFirstIterator(child);
            }
        }
    }
}
