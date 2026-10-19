import {TextRange} from "../../editor/core/coordinate/range/TextRange";
import {Fragment} from "../../editor/core/components/fragments/Fragment";
import {FragmentEvent, FragmentType} from "../../editor/core/components/fragments/FragmentEvent";

export class FragmentsBuilder {
    public static fromFragments(
        fragments: Fragment[],
        range: TextRange,
        extra: FragmentEvent[] = []
    ): FragmentEvent[] {
        const events = fragments.flatMap(f => f.toEvents(range.start, range.end)).concat(extra);

        // Preserve END-after-START ordering at equal positions for editor compatibility.
        return events.sort((a, b) => a.pos - b.pos || ((a.type === FragmentType.END_RANGE ? 1 : 0) - (b.type === FragmentType.END_RANGE ? 1 : 0)));
    }
}
