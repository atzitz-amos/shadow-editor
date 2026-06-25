import {SynNode} from "../../syntax/api/SynNode";
import {SynModificationTree} from "../../syntax/tree/SynModificationTree";

/**
 *
 * @author Atzitz Amos
 * @date 6/6/2026
 * @since 1.0.0
 */
export abstract class QuickFix {
    abstract applyFix(element: SynNode, synModTree: SynModificationTree): void;

    abstract getId(): string;

    abstract getDescription(): string;
}
