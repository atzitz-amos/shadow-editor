import {View} from "../View";
import {HTMLUtils} from "../../utils/HTMLUtils";

export class Gutter {
    view: View;
    element: HTMLDivElement;
    digits: number = 1;

    lines: HTMLDivElement[] = [];
    edgelines: HTMLDivElement[] = [];

    constructor(view: View) {
        this.view = view;
        this.element = HTMLUtils.createElement("div.editor-gutter", view.view) as HTMLDivElement;
    }

    init() {
        this.lines = [];

        let firstEdgeline = HTMLUtils.createElement('div.editor-gutter-line.editor-line-edge', this.element) as HTMLDivElement;
        for (let i = 0; i < this.view.visualLineCount; i++) {
            this.lines.push(HTMLUtils.createElement("div.editor-gutter-line.gutter-line-" + i, this.element) as HTMLDivElement);
        }
        let secondEdgeline = HTMLUtils.createElement('div.editor-gutter-line.editor-line-edge', this.element) as HTMLDivElement;

        this.edgelines = [firstEdgeline, secondEdgeline];
    }

    initCSS() {
        this.update();
    }

    update() {
        this.element.style.setProperty('--editor-gutter-num-size', HTMLUtils.px(this.digits * this.view.getCharSize()));
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