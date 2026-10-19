import {WidgetManager} from "./WidgetManager";
import {TextRange} from "../coordinate/range/TextRange";
import {FragmentsBuilder} from "./fragments/FragmentsBuilder";
import {HTMLUtils} from "../../utils/HTMLUtils";
import {FragmentSpanRenderer} from "../../../core/highlighter/FragmentSpanRenderer";


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
        const events = FragmentsBuilder.build(range, this.manager);

        return FragmentSpanRenderer.render(textContent, range, events, {
            renderInlay: event => {
                const inlayRecord = this.manager.getInlayManager().getInlayAt(event.pos)!;
                const span = document.createElement('span');
                span.className = "inline-flow inlay-flow";
                span.style.width = HTMLUtils.px(inlayRecord.width);
                return span;
            },
            onSpanStyled: (span, fragment) => fragment.addElement(span)
        });
    }
}