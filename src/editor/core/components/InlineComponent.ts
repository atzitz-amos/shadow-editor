import {Editor} from "../../Editor";
import {Component} from "./Component";
import {HTMLComponentView} from "./view/HTMLComponentView";
import {Registry} from "../Registry";
import {TextRange} from "../coordinate/TextRange";

export abstract class InlineComponent implements Component {
    public abstract name: string;
    public id: string;

    public className: string | null = null;

    public abstract range: TextRange;

    protected view: HTMLComponentView | undefined = undefined;

    protected constructor() {
        this.id = Registry.getComponentIDFor(this);
    }

    applyStyle(element: HTMLSpanElement) {
        if (this.className)
            element.classList.add(this.className);
    }

    getRenderedView(): HTMLComponentView | undefined {
        return this.view;
    }

    onRender(view: HTMLComponentView): void {
        this.view = view;
        this.onceRendered();
    }

    onDestroy(editor: Editor): void {
        this.view = undefined;
    }

    onceRendered(): void {

    }
}