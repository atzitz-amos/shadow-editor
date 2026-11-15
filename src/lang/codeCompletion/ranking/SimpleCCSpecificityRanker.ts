import {SynNode} from "../../syntax/api/SynNode";
import {CodeCompletionItem} from "../item/CodeCompletionItem";
import {SimpleCCRanker} from "./SimpleCCRanker";
import {CCRanker} from "./CCRanker";

/**
 *
 * @author Atzitz Amos
 * @date 11/14/2026
 * @since 1.0.0
 */
export class SimpleCCSpecificityRanker extends SimpleCCRanker {
    public static readonly DEFAULT_RANKER: CCRanker = new SimpleCCSpecificityRanker();

    protected rankItem(item: CodeCompletionItem, ctx: SynNode): number {
        return item.getSpecificity();
    }
}
