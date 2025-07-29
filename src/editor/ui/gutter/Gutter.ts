import {View} from "../View";
import {HTMLUtils} from "../../utils/HTMLUtils";

export class Gutter implements Renderable {
    view: View;
    element: HTMLDivElement;

    constructor(view: View) {
        this.view = view;
        this.element = HTMLUtils.createElement("div.editor-gutter", view.view) as HTMLDivElement;
    }

    get numberLength() {
        return 1;
    }

    init() {

    }

    initCSS() {
        this.update();
    }

    update() {
        this.element.style.setProperty('--editor-gutter-num-size', HTMLUtils.px(this.numberLength * this.view.getCharSize()));
    }

    destroy(): void {
    }

    render(): void {
    }
}