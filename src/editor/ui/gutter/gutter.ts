import {View} from "../View";
import {createElement, px} from "../../utils";

export class Gutter implements Renderable {
    view: View;
    element: HTMLDivElement;

    constructor(view: View) {
        this.view = view;
        this.element = createElement("div.editor-gutter", view.view) as HTMLDivElement;
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
        this.element.style.setProperty('--editor-gutter-num-size', px(this.numberLength * this.view.getCharSize()));
    }

    destroy(): void {
    }

    render(): void {
    }
}