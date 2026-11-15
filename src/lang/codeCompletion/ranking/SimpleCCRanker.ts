import {SynNode} from "../../syntax/api/SynNode";
import {CodeCompletionItem} from "../item/CodeCompletionItem";
import {CCRanker} from "./CCRanker";

/**
 *
 * @author Atzitz Amos
 * @date 11/14/2026
 * @since 1.0.0
 */
export abstract class SimpleCCRanker implements CCRanker {
    sort(items: CodeCompletionItem[], ctx: SynNode): CodeCompletionItem[] {
        return items.sort((a, b) => this.rankItem(b, ctx) - this.rankItem(a, ctx));
    }

    protected abstract rankItem(item: CodeCompletionItem, ctx: SynNode): number;
}
