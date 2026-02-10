import {WidgetManager} from "./WidgetManager";
import {TextRange} from "../coordinate/TextRange";
import {FragmentEvent, FragmentType} from "./fragments/FragmentEvent";
import {FragmentsBuilder} from "./fragments/FragmentsBuilder";
import {HTMLUtils} from "../../utils/HTMLUtils";


export type RenderedLineData = {
    gutter: HTMLSpanElement[];
    content: HTMLSpanElement[];
    line: number;
}

export class WidgetRenderer {
    private readonly manager: WidgetManager;

    constructor(manager: WidgetManager) {
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
                content: this.renderWidgets(doc.getLineData(line).getAssociatedRange()),
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

    private renderWidgets(range: TextRange): HTMLSpanElement[] {
        const textContent = this.manager.getDocument().getTextContent()

        const events: FragmentEvent[] = FragmentsBuilder.build(range, this.manager);
        const active: FragmentEvent[] = [];

        let prevPos = range.start;

        const result: HTMLSpanElement[] = [];

        for (const event of events) {
            const currPos = event.pos;

            if (currPos > prevPos) {
                const span = document.createElement('span');
                span.textContent = textContent.substring(prevPos, currPos);

                for (let activeFragment of active) {
                    if (activeFragment.type != FragmentType.INLAY) {
                        activeFragment.getFragment().getFragmentStyle().applyStyle(span);
                        for (let className of activeFragment.getFragment().getClassList()) {
                            span.classList.add(className);
                        }
                        activeFragment.getFragment().addElement(span);
                    }
                }

                result.push(span);
            }

            if (event.type == FragmentType.START_RANGE) {
                active.push(event);
            } else if (event.type == FragmentType.END_RANGE) {
                const index = active.findIndex(x => x.getFragment() === event.getFragment());
                if (index !== -1) active.splice(index, 1);
            } else {
                // Inlay
                const inlayRecord = this.manager.getInlayManager().getInlayAt(event.pos)!;
                const span = document.createElement('span');
                span.className = "inline-flow inlay-flow";
                span.style.width = HTMLUtils.px(inlayRecord.width);
                result.push(span);
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