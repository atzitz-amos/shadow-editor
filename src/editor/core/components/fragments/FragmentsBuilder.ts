import {FragmentEvent, FragmentType} from "./FragmentEvent";
import {TextRange} from "../../coordinate/TextRange";
import {WidgetManager} from "../WidgetManager";

/**
 * Builds fragment events from highlights and components
 *
 * @author Atzitz Amos
 * @date 10/23/2025
 * @since 1.0.0
 */
export class FragmentsBuilder {
    public static build(range: TextRange, manager: WidgetManager): FragmentEvent[] {
        const fragments = manager.getHighlightsHolder().toFragments();
        const events = fragments.flatMap(f => f.toEvents(range.start, range.end));

        for (const inlay of manager.getInlaysInRange(range)) {
            events.push(FragmentEvent.inlay(inlay));
        }

        return events.sort((a, b) => a.pos - b.pos || ((a.type === FragmentType.END_RANGE ? 1 : 0) - (b.type === FragmentType.END_RANGE ? 1 : 0)));
    }
}
