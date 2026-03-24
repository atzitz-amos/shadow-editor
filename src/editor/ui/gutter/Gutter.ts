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

    notifyResize() {
        // update line count
        let lineCount = this.view.getVisualLineCount();
        while (this.lines.length < lineCount) {
            // we need to add a line before the last edgeline
            console.log(this.lines.length)
            let line = HTMLUtils.createElement("div.editor-gutter-line.gutter-line-" + this.lines.length) as HTMLDivElement;
            this.element.insertBefore(line, this.edgelines[1]);
            this.lines.push(line);
        }
        while (this.lines.length > lineCount) {
            let line = this.lines.pop();
            if (line) {
                this.element.removeChild(line);
            }
        }
    }
}