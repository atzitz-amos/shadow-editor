import {ComponentsManager} from "./ComponentsManager";
import {TextRange} from "../coordinate/TextRange";
import {FragmentEvent, FragmentType} from "./fragments/FragmentEvent";
import {FragmentBuilder} from "./fragments/FragmentBuilder";


export type RenderedLineData = {
    gutter: HTMLSpanElement[];
    content: HTMLSpanElement[];
    line: number;
}

export class ComponentsRenderer {
    private manager: ComponentsManager;

    constructor(manager: ComponentsManager) {
        this.manager = manager;
    }

    renderGutterComponents(line: number): HTMLSpanElement[] {
        let components = this.manager.getAssociatedGutterComponents(line)
        return components.map(c => c.render());
    }

    renderLine(line: number): RenderedLineData {
        let doc = this.manager.getDocument();

        if (line >= doc.getLineCount()) {
            return {
                gutter: [],
                content: [],
                line: line
            };
        } else {
            return {
                content: this.renderComponents(doc.getLineData(line).getAssociatedRange()),
                gutter: this.renderGutterComponents(line),
                line: line
            };
        }
    }

    renderNLines(from: number, n: number): RenderedLineData[] {
        let result: RenderedLineData[] = [];

        for (let i = 0; i < n; i++) {
            result.push(this.renderLine(from + i));
        }
        return result;
    }

    private renderComponents(range: TextRange): HTMLSpanElement[] {
        const textContent = this.manager.getDocument().getTextContent()
        const highlights = this.manager.getHighlightsHolder();
        const components = this.manager.getAllComponents();

        const events: FragmentEvent[] = FragmentBuilder.ofRange(range, highlights.toFragments(), components);
        const active: FragmentEvent[] = [];

        let prevPos = range.start;

        const result: HTMLSpanElement[] = [];

        for (const event of events) {
            const currPos = event.pos;

            if (currPos > prevPos) {
                const span = document.createElement('span');
                span.textContent = textContent.substring(prevPos, currPos);

                for (let {fragment} of active) {
                    fragment.getComponentStyle().applyStyle(span);
                    for (let className of fragment.getClassList()) {
                        span.classList.add(className);
                    }
                    fragment.addElement(span);
                }

                result.push(span);
            }

            if (event.type == FragmentType.START) {
                active.push(event);
            } else {
                const index = active.findIndex(x => x.fragment === event.fragment);
                if (index !== -1) active.splice(index, 1);
            }

            prevPos = currPos;
        }
        if (prevPos < range.end) {
            const span = document.createElement('span');
            span.textContent = textContent.substring(prevPos, range.end);
            result.push(span);
        }

        return result;
    }
}