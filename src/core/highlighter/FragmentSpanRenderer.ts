import {TextRange} from "../../editor/core/coordinate/range/TextRange";
import {Fragment} from "../../editor/core/components/fragments/Fragment";
import {FragmentEvent, FragmentType} from "../../editor/core/components/fragments/FragmentEvent";

export type FragmentSpanRendererOptions = {
    renderInlay?: (event: FragmentEvent) => HTMLSpanElement;
    onSpanStyled?: (span: HTMLSpanElement, fragment: Fragment) => void;
};

export class FragmentSpanRenderer {
    public static render(
        text: string,
        range: TextRange,
        events: FragmentEvent[],
        options: FragmentSpanRendererOptions = {}
    ): HTMLSpanElement[] {
        const active: FragmentEvent[] = [];
        let prevPos = range.start;
        const result: HTMLSpanElement[] = [];

        const createTextSpan = (start: number, end: number): HTMLSpanElement => {
            const span = document.createElement('span');
            span.textContent = text.substring(start, end);

            const sortedActive = [...active].sort(
                (a, b) => a.getFragment().getPriority() - b.getFragment().getPriority()
            );

            for (const activeFragment of sortedActive) {
                if (activeFragment.type !== FragmentType.INLAY) {
                    const fragment = activeFragment.getFragment();
                    fragment.getFragmentStyle().applyStyle(span);
                    for (const className of fragment.getClassList()) {
                        span.classList.add(className);
                    }
                    options.onSpanStyled?.(span, fragment);
                }
            }

            return span;
        };

        for (const event of events) {
            const currPos = event.pos;

            if (currPos > prevPos) {
                result.push(createTextSpan(prevPos, currPos));
            }

            if (event.type === FragmentType.START_RANGE) {
                active.push(event);
            } else if (event.type === FragmentType.END_RANGE) {
                const index = active.findIndex(x => x.getFragment() === event.getFragment());
                if (index !== -1) active.splice(index, 1);
            } else if (options.renderInlay) {
                result.push(options.renderInlay(event));
            }

            prevPos = currPos;
        }

        if (prevPos < range.end) {
            result.push(createTextSpan(prevPos, range.end));
        }

        return result;
    }
}
