import {CodeCompletionItem} from "../item/CodeCompletionItem";
import {SynNode} from "../../syntax/api/SynNode";

/**
 *
 * @author Atzitz Amos
 * @date 11/14/2026
 * @since 1.0.0
 */
export interface CCRanker {
    sort(items: CodeCompletionItem[], ctx: SynNode): CodeCompletionItem[];
}
