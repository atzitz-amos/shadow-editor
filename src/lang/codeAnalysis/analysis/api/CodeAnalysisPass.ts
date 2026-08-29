import {SynNodeVisitor} from "../../../syntax/visitors/SynNodeVisitor";
import {Editor} from "../../../../editor/Editor";

/**
 *
 * @author Atzitz Amos
 * @date 8/3/2026
 * @since 1.0.0
 */
export interface CodeAnalysisPass<T> {
    collectVisitors(): SynNodeVisitor[];

    processResults(editor: Editor): void;

    getHolder(): T;

    runOnlyOnVisibleNodes(): boolean;

    getPriority(): number;
}
