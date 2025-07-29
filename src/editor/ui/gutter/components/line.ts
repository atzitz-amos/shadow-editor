import {View} from "../../View";
import {GutterComponent} from "./component";

export class GutterLine implements GutterComponent {
    line: number;
    element: HTMLSpanElement;

    constructor(line: number) {
        this.line = line;
    }


    render(): HTMLSpanElement {
        if (!this.element) {
            this.element = document.createElement('span');
            this.element.className = 'gutter-line-number';
            this.element.textContent = (this.line + 1).toString();
        }
        return this.element;
    }

    getWidth(view: View): number {
        return this.element.getBoundingClientRect().width;
    }

}