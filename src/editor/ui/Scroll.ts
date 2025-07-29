import {View} from "./View";

export class Scrolling {
    view: View;
    scrollX: number;
    scrollY: number;

    constructor(view: View, scrollX: number, scrollY: number) {
        this.view = view;
        this.scrollX = scrollX;
        this.scrollY = scrollY;
    }

    get scrollYLines(): number {
        return Math.ceil(this.scrollY / this.view.getLineHeight());
    }

    set scrollYLines(lines: number) {
        this.scrollY = lines * this.view.getLineHeight();
    }

    get scrollXChars(): number {
        return Math.ceil(this.scrollX / this.view.getCharSize());
    }

    set scrollXChars(chars: number) {
        this.scrollX = chars * this.view.getCharSize();
    }

    get scrollYOffset(): number {
        return this.scrollY % this.view.getLineHeight();
    }

    get scrollXOffset(): number {
        return this.scrollX % this.view.getCharSize();
    }
}

