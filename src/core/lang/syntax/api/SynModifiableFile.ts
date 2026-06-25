import {SynFile} from "./SynFile";
import {SynNode} from "./SynNode";

/**
 *
 * @author Atzitz Amos
 * @date 6/6/2026
 * @since 1.0.0
 */
export interface SynModifiableFile extends SynFile {
    addChild(node: SynNode): void;
}
