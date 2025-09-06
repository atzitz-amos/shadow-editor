import {HScrollBar} from "./HScrollBar";
import {VScrollBar} from "./VScrollBar";
import {View} from "../View";

export class EditorScrollBar {
    private readonly hScrollBar: HScrollBar;
    private readonly vScrollBar: VScrollBar;

    constructor(private view: View) {
        this.hScrollBar = new HScrollBar(this.view);
        this.vScrollBar = new VScrollBar(this.view);
    }

    public getHorizontalScrollBar(): HScrollBar {
        return this.hScrollBar;
    }

    public getVerticalScrollBar(): VScrollBar {
        return this.vScrollBar;
    }

    public render(): void {
        this.hScrollBar.onRender();
        this.vScrollBar.onRender();
    }

    public update(): void {
        this.hScrollBar.update();
        this.vScrollBar.update();
    }
}