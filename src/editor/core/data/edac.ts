import {TextRange} from "../Position";
import {InlineComponent} from "../../ui/components/inline/Inline";
import {GutterComponent} from "../../ui/gutter/components/component";
import {GutterLine} from "../../ui/gutter/components/line";
import {InlineError} from "../../ui/components/inline/InlineError";
import {Editor} from "../../Editor";

export type EDAC = {
    gutter: HTMLSpanElement[];
    content: HTMLSpanElement[];
    line: number;
}

type Event = {
    pos: Offset,
    type: 'start' | 'end',
    component: InlineComponent
}

/**
 * Store the ranges of the components*/
export class EditorComponentsData {
    editor: Editor;

    components: InlineComponent[] = [];
    gutterComponents: GutterComponent[] = [];

    constructor(editor: Editor) {
        this.editor = editor;
    }


    add(component: InlineComponent) {
        this.components.push(component);

        let range = component.range;
    }

    set(range: TextRange, components: Iterable<InlineComponent>) {
        // Remove existing components in the range
        let c = this.components;
        this.clearRange(range);

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

        let events: Event[] = components.flatMap(component => {
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

                    // Assume we take content from bottommost component (first pushed)
                    const top = active[0];
                    const relativeStart = Math.max(prevPos, top.range.begin);
                    const relativeEnd = Math.min(currPos, top.range.end);
                    const content = top.content.slice(relativeStart - top.range.begin, relativeEnd - top.range.begin);

                    const span = document.createElement('span');
                    span.className = mergedClass;
                    span.textContent = content;

                    active.forEach(x => x.onRender(this.editor, span));

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

    gutterToRenderables(line: number): HTMLSpanElement[] {
        let components = this.gutterComponents.filter(component => component.line === line);
        return components.concat([new GutterLine(line)]).map(c => c.render());
    }

    clearRange(range: TextRange) {
        let newComponents: InlineComponent[] = [], newGutterComponents: GutterComponent[] = [];

        for (let component of this.components) {
            if (component.range.overlaps(range)) {
                component.onDestroy(this.editor);
            } else {
                newComponents.push(component)
            }
        }

        for (let component of this.gutterComponents) {
            let begin = this.editor.createPositionFromOffset(range.begin);
            let end = this.editor.createPositionFromOffset(range.end);
            if (component.line >= begin.y && component.line <= end.y) {
                component.onDestroy(this.editor);
            } else {
                newGutterComponents.push(component)
            }
        }

        this.components = newComponents;
        this.gutterComponents = newGutterComponents;
    }

    registerError(error: InlineError) {
        this.components.push(error);
    }
}
