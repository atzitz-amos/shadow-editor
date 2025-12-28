import {View} from "../view/View";
import {HTMLUtils} from "../../utils/HTMLUtils";

export class Gutter {
    view: View;
    element: HTMLDivElement;
    nDigits: number = 1;

    lines: HTMLDivElement[] = [];
    edgelines: HTMLDivElement[] = [];

    constructor(view: View) {
        this.view = view;
        this.element = HTMLUtils.createElement("div.editor-gutter") as HTMLDivElement;
    }

    init() {
        this.lines = [];

        let firstEdgeline = HTMLUtils.createElement('div.editor-gutter-line.editor-line-edge', this.element) as HTMLDivElement;
        for (let i = 0; i < this.view.getVisualLineCount(); i++) {
            this.lines.push(HTMLUtils.createElement("div.editor-gutter-line.gutter-line-" + i, this.element) as HTMLDivElement);
        }
        let secondEdgeline = HTMLUtils.createElement('div.editor-gutter-line.editor-line-edge', this.element) as HTMLDivElement;

        this.edgelines = [firstEdgeline, secondEdgeline];

        this.view.getViewElement().appendChild(this.element);
    }

    initCSS() {
        this.update();
    }

    update() {
        this.element.style.setProperty('--editor-gutter-num-size', HTMLUtils.px(this.nDigits * this.view.getCharSize()));
    }

    destroy(): void {
    }

    renderLine(n: number, content: HTMLSpanElement[]): void {
        this.lines[n].innerHTML = '';
        this.lines[n].append(...content);
    }

    renderEdgeLine(n: number, content: HTMLSpanElement[]): void {
        this.edgelines[n].innerHTML = '';
        this.edgelines[n].append(...content);
    }
}