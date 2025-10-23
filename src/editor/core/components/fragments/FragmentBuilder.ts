import {Fragment} from "./Fragment";
import {InlineComponent} from "../InlineComponent";
import {FragmentEvent, FragmentType} from "./FragmentEvent";
import {TextRange} from "../../coordinate/TextRange";

/**
 * Builds fragment events from highlights and components
 *
 * @author Atzitz Amos
 * @date 10/23/2025
 * @since 1.0.0
 */
export class FragmentBuilder {
    public static ofRange(range: TextRange, fragments: Fragment[], components: InlineComponent[]) {
        // TODO: components
        return fragments.flatMap(f => {
            if (f.getRange().end < range.start || f.getRange().start > range.end) {
                return [];
            }

            let start = Math.max(f.getRange().start, range.start);
            let end = Math.min(f.getRange().end, range.end);
            return [
                new FragmentEvent(FragmentType.START, f, start),
                new FragmentEvent(FragmentType.END, f, end)
            ];
        }).sort((a, b) => a.pos - b.pos || ((a.type === FragmentType.END ? 1 : 0) - (b.type === FragmentType.END ? 1 : 0)));
    }
}
