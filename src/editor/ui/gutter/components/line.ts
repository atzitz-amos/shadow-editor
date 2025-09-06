import {View} from "../../View";
import {GutterComponent} from "./component";
import {Registry} from "../../../core/Registry";
import {Editor} from "../../../Editor";

export class GutterLine implements GutterComponent {
    name: "gutter-line";
    id: string;

    line: number;
    element: HTMLSpanElement;

    constructor(line: number) {
        this.id = Registry.getComponentIDFor(this);

        this.line = line;
    }

    onDestroy(editor: Editor): void {
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