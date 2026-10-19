import {FragmentSpanRenderer} from "./FragmentSpanRenderer";
import {FragmentsBuilder} from "./FragmentsBuilder";
import {Fragment} from "../../editor/core/components/fragments/Fragment";
import {TextRange} from "../../editor/core/coordinate/range/TextRange";

export type SimpleHighlighterOptions = {
    lineClassName?: string;
};

export class SimpleHighlighter {
    constructor(
        private readonly fragments: Fragment[],
        private readonly options: SimpleHighlighterOptions = {}
    ) {
    }

    render(text: string): HTMLSpanElement[] {
        const result: HTMLSpanElement[] = [];
        let offset = 0;

        for (const line of text.split('\n')) {
            const range = new TextRange(offset, offset + line.length);
            const events = FragmentsBuilder.fromFragments(this.fragments, range);
            result.push(...FragmentSpanRenderer.render(text, range, events));
            offset += line.length + 1;
        }

        return result;
    }

    renderInto(container: HTMLElement, text: string): void {
        let offset = 0;
        const lineClassName = this.options.lineClassName ?? "line";

        for (const line of text.split('\n')) {
            const range = new TextRange(offset, offset + line.length);
            const events = FragmentsBuilder.fromFragments(this.fragments, range);
            const lineElement = document.createElement('div');
            lineElement.className = lineClassName;
            for (const span of FragmentSpanRenderer.render(text, range, events)) {
                lineElement.append(span);
            }
            container.append(lineElement);
            offset += line.length + 1;
        }
    }
}
