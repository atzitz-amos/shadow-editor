import {Editor} from "../../Editor";
import {Component} from "./Component";
import {HTMLComponentView} from "./view/HTMLComponentView";
import {Registry} from "../Registry";
import {TextRange} from "../coordinate/TextRange";

export abstract class InlineComponent implements Component {
    public abstract name: string;
    public id: string;

    public className: string;
    public content: string;

    public range: TextRange;

    protected view: HTMLComponentView | undefined = undefined;

    protected constructor() {
        this.id = Registry.getComponentIDFor(this);
    }

    getRenderedView(): HTMLComponentView | undefined {
        return this.view;
    }

    onDestroy(editor: Editor): void {
        this.view = undefined;
    }

    onRender(view: HTMLComponentView): void {
        this.view = view;
        this.onceRendered();
    }

    onceRendered(): void {

    }
}