import {View} from "./View";
import {Caret} from "../../core/caret/Caret";
import {HTMLUtils} from "../../utils/HTMLUtils";
import {CaretRemovedEvent} from "../../core/caret/events/CaretRemovedEvent";
import {CaretAddedEvent} from "../../core/caret/events/CaretAddedEvent";


export class TextLayer {
    visualLineCount: number;

    lines: HTMLDivElement[];
    edgelines: HTMLDivElement[];

    element: HTMLDivElement;
    view: View;

    constructor(view: View, root: HTMLElement, className: string = 'div.editor-layer.layer-inner') {
        this.view = view;
        this.element = HTMLUtils.createElement(className, root) as HTMLDivElement;
    }

    init() {
        this.visualLineCount = this.view.getVisualLineCount();
        this.lines = [];

        let firstEdgeline = HTMLUtils.createElement('div.editor-line.editor-line-edge', this.element) as HTMLDivElement;
        for (let i = 0; i < this.visualLineCount; i++) {
            this.lines.push(HTMLUtils.createElement("div.editor-line.line-" + i, this.element) as HTMLDivElement);
        }
        let secondEdgeline = HTMLUtils.createElement('div.editor-line.editor-line-edge', this.element) as HTMLDivElement;

        this.edgelines = [firstEdgeline, secondEdgeline];
    }

    renderLine(n: number, content: HTMLSpanElement[]) {
        this.lines[n].innerHTML = '';
        this.lines[n].append(...content);
    }

    renderEdgeLine(n: number, content: HTMLSpanElement[]) {
        this.edgelines[n].innerHTML = '';
        this.edgelines[n].append(...content);
    }

    notifyResize() {
        // update line count
        let newVisualLineCount = this.view.getVisualLineCount();
        if (newVisualLineCount > this.visualLineCount) {
            for (let i = this.visualLineCount; i < newVisualLineCount; i++) {
                // we need to insert the new line before the second edgeline
                let newLine = HTMLUtils.createElement("div.editor-line.line-" + i, this.element) as HTMLDivElement;
                this.element.insertBefore(newLine, this.edgelines[1]);
                this.lines.push(newLine);
            }
        } else if (newVisualLineCount < this.visualLineCount) {
            for (let i = newVisualLineCount; i < this.visualLineCount; i++) {
                this.lines[i].remove();
            }
            this.lines.splice(newVisualLineCount, this.visualLineCount - newVisualLineCount);
        }
        this.visualLineCount = newVisualLineCount;
    }
}

export class CaretLayer {
    private _caret: HTMLDivElement;
    private _input: HTMLInputElement;
    private _blink: NodeJS.Timeout;
    private readonly view: View;
    private readonly element: HTMLDivElement;

    constructor(view: View, root: HTMLElement) {
        this.view = view;
        this.element = HTMLUtils.createElement('div.editor-layer.layer-caret', root) as HTMLDivElement;

        this._caret = HTMLUtils.createElement('div.editor-caret#caret-0', this.element) as HTMLDivElement;
        this._input = HTMLUtils.createElement('input.editor-input', this.element) as HTMLInputElement;

        this._blink = setInterval(() => this.blink(), 750);
    }

    public blinkReset() {
        this._caret.classList.remove("blink");
        clearInterval(this._blink);
        this._blink = setInterval(this.blink.bind(this), 750);
    }

    focus() {
        this._input.focus();
    }

    /**
     +--------------------------+
     |           Init           |
     +--------------------------+    */

    init() {
    }

    setupEventListeners() {
        this._input.addEventListener('input', (e: any) => {
            this.view.onInput(e);
            this.blinkReset();
        });

        this._input.addEventListener('keydown', (e: KeyboardEvent) => {
            this.view.onKeyDown(e);
        });

        this._input.addEventListener('keyup', (e: KeyboardEvent) => {
            this.view.onKeyUp(e);
        });

        this._input.addEventListener('focus', e => {
            this.view.onFocus(e);
            this.blinkReset();
        });

        this._input.addEventListener('blur', e => {
            this.view.onBlur(e);
            this.blinkReset();
        });
    }

    render(): void {
        this.update();
    }

    update(): void {
        this.view.getEditor().getCaretModel().forEachCaret(caret => {
            const caretEl = this.getCaretElement(caret);
            const xy = caret.getXY();

            caretEl.style.top = HTMLUtils.px(xy.y);
            caretEl.style.left = HTMLUtils.px(xy.x);
        });
    }

    getCaretElement(caret: Caret): HTMLDivElement {
        return this.element.querySelector(`#caret-${caret.id}`) as HTMLDivElement;
    }

    private blink() {
        this._caret.classList.toggle('blink');
    }
}

class CaretSelectionElement {
    view: View;
    caret: Caret;

    selectionStartEl: HTMLDivElement;
    selectionBodyEl: HTMLDivElement;
    selectionEndEl: HTMLDivElement;

    constructor(layer: SelectionLayer, caret: Caret) {
        this.view = layer.view;
        this.caret = caret;

        this.selectionStartEl = HTMLUtils.createElement('div.editor-selection.selection-start', layer.element) as HTMLDivElement;
        this.selectionBodyEl = HTMLUtils.createElement('div.editor-selection.selection-body', layer.element) as HTMLDivElement;
        this.selectionEndEl = HTMLUtils.createElement('div.editor-selection.selection-end', layer.element) as HTMLDivElement;
    }

    render() {
        this.selectionStartEl.style.display = 'none';
        this.selectionBodyEl.style.display = 'none';
        this.selectionEndEl.style.display = 'none';


        let selection = this.caret.selectionModel;
        if (selection.isSelectionActive) {
            let start = this.view.editor.logicalToXY(selection.getStart());
            let end = this.view.editor.logicalToXY(selection.getEnd());

            let sx = start.x, sy = start.y, ex = end.x, ey = end.y;
            if (sy > ey) {
                [sy, ey] = [ey, sy];
                [sx, ex] = [ex, sx];
            } else if (sy === ey && sx > ex) {
                [sx, ex] = [ex, sx];
            }

            let lineCount = (ey - sy) / this.view.getLineHeight();

            if (sy === ey) {
                this.selectionStartEl.style.display = 'block';
                this.selectionStartEl.style.left = HTMLUtils.px(sx);
                this.selectionStartEl.style.top = HTMLUtils.px(sy);
                this.selectionStartEl.style.width = HTMLUtils.px(ex - sx);
            } else {
                this.selectionStartEl.style.display = 'block';
                this.selectionStartEl.style.left = HTMLUtils.px(sx);
                this.selectionStartEl.style.top = HTMLUtils.px(sy);
                this.selectionStartEl.style.width = HTMLUtils.px(this.view.getViewWidth());
                if (lineCount > 1) {
                    this.selectionBodyEl.style.display = 'block';
                    this.selectionBodyEl.style.top = HTMLUtils.px(sy + this.view.getLineHeight());
                    this.selectionBodyEl.style.height = HTMLUtils.px((lineCount - 1) * this.view.getLineHeight());
                }
                this.selectionEndEl.style.display = 'block';
                this.selectionEndEl.style.top = HTMLUtils.px(ey);
                this.selectionEndEl.style.width = HTMLUtils.px(ex);
            }
        }
    }
}

class SelectionLayer {
    selectionElements: Map<number, CaretSelectionElement> = new Map();
    view: View;
    element: HTMLDivElement;

    constructor(view: View, root: HTMLElement) {
        this.view = view;
        this.element = HTMLUtils.createElement('div.editor-layer.layer-selection', root) as HTMLDivElement;
    }

    init() {
        this.view.getEditor().getCaretModel().forEachCaret(caret => {
            this.selectionElements.set(caret.id, new CaretSelectionElement(this, caret));
        });

        this.view.getEditor().getEventBus().subscribe(this, CaretRemovedEvent.SUBSCRIBER, e => {
            this.selectionElements.delete(e.getCaret().id);
        });

        this.view.getEditor().getEventBus().subscribe(this, CaretAddedEvent.SUBSCRIBER, e => {
            this.selectionElements.set(e.getCaret().id, new CaretSelectionElement(this, e.getCaret()));
        });
    }

    render(): void {
        this.update();
    }

    update(): void {
        this.selectionElements.forEach(el => el.render())
    }
}

export class ActiveLineLayer {
    private readonly _activeLine: HTMLDivElement;
    private readonly view: View;
    private readonly element: HTMLDivElement;

    constructor(view: View, root: HTMLElement) {
        this.view = view;
        this.element = HTMLUtils.createElement('div.editor-layer.layer-active-line', root);

        this._activeLine = HTMLUtils.createElement('div.editor-active-line', this.element);
    }

    init() {
    }

    render(): void {
        this.update();
    }

    update(): void {
        let pos = this.view.editor.visualToXY(this.view.editor.getPrimaryCaret().getVisual());
        this._activeLine.style.top = HTMLUtils.px(pos.y);
    }
}

export class OverlayLayer extends TextLayer {
    overlayPerLine: HTMLSpanElement[][] = [];

    constructor(view: View, root: HTMLElement) {
        super(view, root, "div.editor-layer.layer-overlay.layer-inner");
    }

    init() {
        super.init();

        for (let i = 0; i < this.lines.length + 2; i++) {
            this.overlayPerLine.push([]);
        }
    }

    addOverlayOnLine(n: number, element: HTMLSpanElement) {
        this.overlayPerLine[n].push(element);
    }

    renderAndClear() {
        for (let i = 1; i < this.overlayPerLine.length - 1; i++) {
            this.renderLine(i - 1, this.overlayPerLine[i]);
            this.overlayPerLine[i] = [];
        }

        this.renderEdgeLine(0, this.overlayPerLine[0]);
        this.renderEdgeLine(1, this.overlayPerLine[this.overlayPerLine.length - 1]);
        this.overlayPerLine[0] = [];
        this.overlayPerLine[this.overlayPerLine.length - 1] = [];
    }
}

export class ViewLayers {
    public layers_el: HTMLDivElement;

    private readonly text: TextLayer;
    private readonly caret: CaretLayer;
    private readonly selection: SelectionLayer;
    private readonly activeLine: ActiveLineLayer;
    private readonly overlayLayer: OverlayLayer;

    constructor(private view: View) {
        this.layers_el = HTMLUtils.createElement('div.editor-layers') as HTMLDivElement;

        this.text = new TextLayer(view, this.layers_el);
        this.caret = new CaretLayer(view, this.layers_el);
        this.selection = new SelectionLayer(view, this.layers_el);
        this.activeLine = new ActiveLineLayer(view, this.layers_el);
        this.overlayLayer = new OverlayLayer(view, this.layers_el);
    }

    init() {
        this.text.init();
        this.caret.init();
        this.selection.init();
        this.activeLine.init();
        this.overlayLayer.init();

        this.view.getViewElement().appendChild(this.layers_el);
    }

    setupEventListeners() {
        this.caret.setupEventListeners();
    }

    destroy(): void {
        this.layers_el.remove();
    }

    render(): void {
        this.caret.render();
        this.selection.render();
        this.activeLine.render();
    }

    update(): void {
        this.caret.update();
        this.selection.update();
        this.activeLine.update();
    }

    getTextLayer(): TextLayer {
        return this.text;
    }

    getCaretLayer(): CaretLayer {
        return this.caret;
    }

    getSelectionLayer(): SelectionLayer {
        return this.selection;
    }

    getActiveLineLayer(): ActiveLineLayer {
        return this.activeLine;
    }

    getOverlayLayer(): OverlayLayer {
        return this.overlayLayer;
    }
}



