import {EditorComponentsManager} from "./EditorComponentsManager";
import {TextRange} from "../coordinate/TextRange";
import {InlineComponent} from "./InlineComponent";
import {HTMLViewUtils} from "./view/HTMLViewUtils";
import {InlayComponent} from "../../ui/components/inline/inlays/InlayComponent";


export type EDAC = {
    gutter: HTMLSpanElement[];
    content: HTMLSpanElement[];
    line: number;
}

type Event = {
    pos: Offset,
    type: 'start' | 'end',
    component: InlineComponent,
    spans?: HTMLSpanElement[]
}

export class EditorComponentsRenderer {
    private manager: EditorComponentsManager;

    constructor(manager: EditorComponentsManager) {
        this.manager = manager;
    }

    render(range: TextRange) {
        return this.renderComponents(this.manager.getComponentsForRange(range), range.begin);
    }

    renderGutterComponents(line: number): HTMLSpanElement[] {
        let components = this.manager.getAssociatedGutterComponents(line)
        return components.map(c => c.render());
    }

    renderLine(line: number): EDAC {
        let doc = this.manager.getDocument();

        if (line >= doc.getLineCount()) {
            return {
                gutter: [],
                content: [],
                line: line
            };
        } else {
            return {
                content: this.render(doc.getLineData(line).getAssociatedRange()),
                gutter: this.renderGutterComponents(line),
                line: line
            };
        }
    }

    renderNLines(from: number, n: number): EDAC[] {
        let result: EDAC[] = [];

        for (let i = 0; i < n; i++) {
            result.push(this.renderLine(from + i));
        }
        return result;
    }

    private renderComponents(components?: InlineComponent[], startingOffset: Offset = 0): HTMLSpanElement[] {
        components ??= this.manager.getAllComponents();
        if (!components.length) return [];

        let events: Event[] = components.flatMap(component => {
            return [
                {pos: component.range.begin, type: 'start', component, spans: []},
                {pos: component.range.end, type: 'end', component}
            ];
        });
        events.sort((a, b) => a.pos - b.pos || (a.type === 'end' ? 1 : -1));

        const spans: HTMLSpanElement[] = [];
        let active: Event[] = [];
        let prevPos = startingOffset;

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
                    let mergedClass = "";

                    // Assume we take content from bottommost component (first pushed)
                    let content: string = "";
                    let relativeStart: number, relativeEnd: number;
                    for (let component of active) {
                        let top = component.component;
                        if (top.content != null) {
                            relativeStart = Math.max(prevPos, top.range.begin);
                            relativeEnd = Math.min(currPos, top.range.end);
                            content = top.content.slice(relativeStart - top.range.begin, relativeEnd - top.range.begin);
                            mergedClass += top.className;
                        }
                        if (top instanceof InlayComponent) {
                            let span = top.getInsertedElement();
                            spans.push(span);
                            component.spans?.push(span);
                        }
                    }


                    const span = document.createElement('span');
                    span.className = mergedClass;
                    span.textContent = content;

                    spans.push(span);
                    active.forEach(c => c.spans?.push(span))
                }
            }

            // Update active stack
            if (event.type === 'start') {
                active.push(event);
            } else {
                const index = active.findIndex(x => x.component === event.component);
                const startEvent = active[index];
                startEvent.component.onRender(HTMLViewUtils.createView(this.manager.editor, startEvent.spans!))
                if (index !== -1) active.splice(index, 1);
            }

            prevPos = currPos;
        }

        return spans;
    }
}