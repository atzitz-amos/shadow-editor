import {View} from "./View";
import {Caret} from "../core/Caret";
import {HTMLUtils} from "../utils/HTMLUtils";


abstract class AbstractLayer {
    view: View;
    element: HTMLDivElement;

    abstract init(): void;

    abstract destroy(): void;

    abstract render(): void;

    abstract update(): void;
}

export class TextLayer extends AbstractLayer {
    visualLineCount: number;

    lines: HTMLDivElement[];
    edgelines: HTMLDivElement[];

    constructor(view: View, root: HTMLElement) {
        super();
        this.view = view;
        this.element = HTMLUtils.createElement('div.editor-layer.layer-inner', root) as HTMLDivElement;
    }

    init() {
        this.visualLineCount = this.view.visualLineCount;
        this.lines = [];

        let firstEdgeline = HTMLUtils.createElement('div.editor-line.editor-line-edge', this.element) as HTMLDivElement;
        for (let i = 0; i < this.visualLineCount; i++) {
            this.lines.push(HTMLUtils.createElement("div.editor-line.line-" + i, this.element) as HTMLDivElement);
        }
        let secondEdgeline = HTMLUtils.createElement('div.editor-line.editor-line-edge', this.element) as HTMLDivElement;

        this.edgelines = [firstEdgeline, secondEdgeline];
    }

    destroy(): void {
    }

    render(): void {
    }

    update(): void {
    }

    renderLine(n: number, content: HTMLSpanElement[]) {
        this.lines[n].innerHTML = '';
        this.lines[n].append(...content);
    }

    renderEdgeLine(n: number, content: HTMLSpanElement[]) {
        this.edgelines[n].innerHTML = '';
        this.edgelines[n].append(...content);
    }
}

export class CaretLayer extends AbstractLayer {
    private _caret: HTMLDivElement;
    private _input: HTMLInputElement;
    private _blink: NodeJS.Timeout;

    constructor(view: View, root: HTMLElement) {
        super();
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
            this.view.editor.fire('onInput', e);
            this.blinkReset();
        });

        this._input.addEventListener('keydown', (e: KeyboardEvent) => {
            this.view.editor.fire('onKeyDown', e);
        });

        this._input.addEventListener('keyup', (e: KeyboardEvent) => {
            this.view.editor.fire('onKeyUp', e);
        });

        this._input.addEventListener('focus', e => {
            this.view.editor.fire('onFocus', e);
            this.blinkReset();
        });

        this._input.addEventListener('blur', e => {
            this.view.editor.fire('onBlur', e);
            this.blinkReset();
        });
    }

    destroy(): void {
    }

    render(): void {
        this.update();
    }

    update(): void {
        this.view.editor.caretModel.forEachCaret(caret => {
            let caretEl = this.getCaretElement(caret);
            caretEl.style.top = HTMLUtils.px(caret.position.toVisual().y);
            caretEl.style.left = HTMLUtils.px(caret.position.toVisual().x);
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
        if (selection.isSelectionActive && selection.start && selection.end) {

            let start = selection.start.toVisual()
            let end = selection.end.toVisual();

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

class SelectionLayer extends AbstractLayer {
    selectionElements: Map<number, CaretSelectionElement> = new Map();

    constructor(view: View, root: HTMLElement) {
        super();
        this.view = view;
        this.element = HTMLUtils.createElement('div.editor-layer.layer-selection', root) as HTMLDivElement;
    }

    init() {
        this.view.editor.caretModel.forEachCaret(caret => {
            this.selectionElements.set(caret.id, new CaretSelectionElement(this, caret));
        });
    }

    destroy(): void {
    }

    render(): void {
        this.update();
    }

    update(): void {
        this.selectionElements.forEach(el => el.render())
    }
}

export class ActiveLineLayer extends AbstractLayer {
    private readonly _activeLine: HTMLDivElement;

    constructor(view: View, root: HTMLElement) {
        super();
        this.view = view;
        this.element = HTMLUtils.createElement('div.editor-layer.layer-active-line', root) as HTMLDivElement;

        this._activeLine = HTMLUtils.createElement('div.editor-active-line', this.element) as HTMLDivElement;
    }

    init() {
        const P = this.view.editor.properties;
    }

    destroy(): void {
    }

    render(): void {
        this.update();
    }

    update(): void {
        let pos: number = this.view.editor.caretModel.primary.position.toVisual().y;
        this._activeLine.style.top = HTMLUtils.px(pos);
    }
}

export class ErrorLayer extends AbstractLayer {
    constructor(view: View, root: HTMLElement) {
        super();
        this.view = view;
        this.element = HTMLUtils.createElement('div.editor-layer.layer-error', root) as HTMLDivElement;
    }

    init(): void {
    }

    destroy(): void {
    }

    render(): void {
    }

    update(): void {
    }
}

export class Layers {
    public layers_el: HTMLDivElement;

    public text: TextLayer;
    public caret: CaretLayer;
    public selection: SelectionLayer;
    public activeLine: ActiveLineLayer;

    constructor(view: View) {
        this.layers_el = HTMLUtils.createElement('div.editor-layers', view.view) as HTMLDivElement;

        this.text = new TextLayer(view, this.layers_el);
        this.caret = new CaretLayer(view, this.layers_el);
        this.selection = new SelectionLayer(view, this.layers_el);
        this.activeLine = new ActiveLineLayer(view, this.layers_el);
    }

    init() {
        this.text.init();
        this.caret.init();
        this.selection.init();
        this.activeLine.init();
    }

    setupEventListeners() {
        this.caret.setupEventListeners();
    }

    destroy(): void {
        this.text.destroy();
        this.caret.destroy();
        this.selection.destroy();
        this.activeLine.destroy();

        this.layers_el.remove();
    }

    render(): void {
        this.text.render();
        this.caret.render();
        this.selection.render();
        this.activeLine.render();
    }

    update(): void {
        this.text.update();
        this.caret.update();
        this.selection.update();
        this.activeLine.update();
    }
}



