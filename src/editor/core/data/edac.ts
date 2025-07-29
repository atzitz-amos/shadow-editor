import {TextRange} from "../Position";
import {InlineComponent} from "../../ui/components/Inline";

/**
 * Store the ranges of the components*/
export class EditorComponentsData {
    components: InlineComponent[] = [];

    add(component: InlineComponent) {
        this.components.push(component);

        let range = component.range;
    }

    set(range: TextRange, components: Iterable<InlineComponent>) {
        // Remove existing components in the range
        this.components = this.components.filter(x => !x.range.overlaps(range));

        for (const component of components) {
            this.add(component);
        }
    }

    getRanges(): TextRange[] {
        return this.components.map(x => x.range);
    }

    toRenderables(components?: InlineComponent[], startPos: Offset = 0): HTMLSpanElement[] {
        components ??= this.components;
        if (!components.length) return [];

        let events = components.flatMap(component => {
            return [
                {pos: component.range.begin, type: 'start', component},
                {pos: component.range.end, type: 'end', component}
            ];
        });
        events.sort((a, b) => a.pos - b.pos || (a.type === 'end' ? 1 : -1));

        const spans: HTMLSpanElement[] = [];
        let active: InlineComponent[] = [];
        let prevPos = startPos;

        for (const event of events) {
            const currPos = event.pos;

            if (currPos > prevPos) {
                if (active.length === 0) {
                    // No active component → insert plain spaces
                    const span = document.createElement('span');
                    span.textContent = ' '.repeat(currPos - prevPos);
                    spans.push(span);
                } else {
                    // Merge classNames from all active components
                    const mergedClass = active.map(c => c.className).join(' ').trim();

                    // Assume we take content from topmost component (last pushed)
                    const top = active[active.length - 1];
                    const relativeStart = Math.max(prevPos, top.range.begin);
                    const relativeEnd = Math.min(currPos, top.range.end);
                    const content = top.content.slice(relativeStart - top.range.begin, relativeEnd - top.range.begin);

                    const span = document.createElement('span');
                    span.className = mergedClass;
                    span.textContent = content;
                    spans.push(span);
                }
            }

            // Update active stack
            if (event.type === 'start') {
                active.push(event.component);
            } else {
                const index = active.indexOf(event.component);
                if (index !== -1) active.splice(index, 1);
            }

            prevPos = currPos;
        }

        return spans;
    }

    query(range: TextRange): InlineComponent[] {
        return this.components.filter(component => range.contains(component.range));
    }
}

type Event = {
    pos: Offset,
    type: 'start' | 'end',
    component: InlineComponent
}