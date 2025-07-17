import {createElement, px} from "../utils";
import {View} from "./View";
import {Caret} from "../core/Caret";


abstract class AbstractLayer implements Renderable {
    protected view: View;
    protected element: HTMLDivElement;

    abstract init(): void;

    abstract destroy(): void;

    abstract render(): void;

    abstract update(): void;
}

export class TextLayer extends AbstractLayer {
    constructor(view: View, root: HTMLElement) {
        super();
        this.view = view;
        this.element = createElement('div.editor-layer.layer-inner', root) as HTMLDivElement;
    }

    init() {
    }

    destroy(): void {
    }

    render(): void {
    }

    update(): void {
    }
}

export class CaretLayer extends AbstractLayer {
    private _caret: HTMLDivElement;
    private _input: HTMLInputElement;
    private _blink: NodeJS.Timeout;

    constructor(view: View, root: HTMLElement) {
        super();
        this.view = view;
        this.element = createElement('div.editor-layer.layer-caret', root) as HTMLDivElement;

        this._caret = createElement('div.editor-caret#caret-0', this.element) as HTMLDivElement;
        this._input = createElement('input.editor-input', this.element) as HTMLInputElement;

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
        this._input.addEventListener('input', (e: Event) => {
            this.view.editor.fire('onInput', e);
            this.blinkReset();
        });

        this._input.addEventListener('keydown', (e: KeyboardEvent) => {
            this.view.editor.fire('onKeyDown', e);
        });

        this._input.addEventListener('keyup', (e: KeyboardEvent) => {
            this.view.editor.fire('onKeyUp', e);
        });

        this._input.addEventListener('focus', () => {
            this.view.editor.fire('onFocus');
            this.blinkReset();
        });

        this._input.addEventListener('blur', () => {
            this.view.editor.fire('onBlur');
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
            caretEl.style.top = px(caret.position.toLogical().y * this.view.editor.properties.view!.lineHeight!);
            caretEl.style.left = px(caret.position.toLogical().x * this.view.getCharSize());
        });
    }

    getCaretElement(caret: Caret): HTMLDivElement {
        return this.element.querySelector(`#caret-${caret.id}`) as HTMLDivElement;
    }

    private blink() {
        this._caret.classList.toggle('blink');
    }
}

class SelectionLayer extends AbstractLayer {
    constructor(view: View, root: HTMLElement) {
        super();
        this.view = view;
        this.element = createElement('div.editor-layer.layer-selection', root) as HTMLDivElement;
    }

    init() {

    }

    destroy(): void {
    }

    render(): void {
    }

    update(): void {
    }
}

export class ActiveLineLayer extends AbstractLayer {
    private readonly _activeLine: HTMLDivElement;

    constructor(view: View, root: HTMLElement) {
        super();
        this.view = view;
        this.element = createElement('div.editor-layer.layer-active-line', root) as HTMLDivElement;

        this._activeLine = createElement('div.editor-active-line', this.element) as HTMLDivElement;
    }

    init() {
        const P = this.view.editor.properties;
    }

    destroy(): void {
    }

    render(): void {
    }

    update(): void {
    }
}

export class ErrorLayer extends AbstractLayer {
    constructor(view: View, root: HTMLElement) {
        super();
        this.view = view;
        this.element = createElement('div.editor-layer.layer-error', root) as HTMLDivElement;
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

export class Layers implements Renderable {
    public layers_el: HTMLDivElement;

    public text: TextLayer;
    public caret: CaretLayer;
    public selection: SelectionLayer;
    public activeLine: ActiveLineLayer;

    constructor(view: View) {
        this.layers_el = createElement('div.editor-layers', view.view) as HTMLDivElement;

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



