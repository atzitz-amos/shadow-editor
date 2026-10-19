import {FragmentEvent} from "./FragmentEvent";
import {TextRange} from "../../coordinate/range/TextRange";
import {WidgetManager} from "../WidgetManager";
import {Fragment} from "./Fragment";
import {FragmentsBuilder as CoreFragmentsBuilder} from "../../../../core/highlighter/FragmentsBuilder";

/**
 * Builds fragment events from highlights and components
 *
 * @author Atzitz Amos
 * @date 10/23/2025
 * @since 1.0.0
 */
export class FragmentsBuilder {
    public static build(range: TextRange, manager: WidgetManager): FragmentEvent[] {
        let fragments = manager.getDocument().getHighlightsHolder().toFragments();
        fragments = fragments.concat(manager.getDocument().getAnnotationsHolder().toFragments());
        const extra: FragmentEvent[] = [];

        for (const inlay of manager.getInlaysInRange(range)) {
            extra.push(FragmentEvent.inlay(inlay.getOffset()));
        }

        return CoreFragmentsBuilder.fromFragments(fragments, range, extra);
    }

    public static fromFragments(
        fragments: Fragment[],
        range: TextRange,
        extra: FragmentEvent[] = []
    ): FragmentEvent[] {
        return CoreFragmentsBuilder.fromFragments(fragments, range, extra);
    }
}
