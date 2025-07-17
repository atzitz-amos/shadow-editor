import {Editor} from "../Editor";
import {Layers} from "./Layers";
import {Gutter} from "./gutter/gutter";
import {AbstractVisualEventListener} from "../core/events/events";

import {createElement, px} from "../utils";
import {defaults} from "../Properties";


function _sizer(view) {
    let sizer = createElement("div.editor-sizer", view.view);
    sizer.innerHTML = "a";

    return () => sizer.getBoundingClientRect().width;
}

export class View implements Renderable {
    editor: Editor;

    view: HTMLDivElement;

    gutter: Gutter;

    layers: Layers;

    // Properties
    getCharSize: () => number;

    constructor(editor: Editor) {
        this.editor = editor;

        this.editor.addVisualEventListener(new class extends AbstractVisualEventListener {
            onBlur(editor: Editor, event: FocusEvent): void {
                editor.root.classList.remove('focused');
            }

            onFocus(editor: Editor, event: FocusEvent): void {
                editor.root.classList.add('focused');
            }

            onMouseDown(editor: Editor, event: MouseEvent) {
                event.preventDefault();
                editor.view.focus();
            }
        });
    }

    /**
     +--------------------------+
     |          Config          |
     +--------------------------+    */

    onAttached(editor: Editor, root: HTMLElement) {
        this.view = createElement('div.editor-view', root) as HTMLDivElement;

        this.gutter = new Gutter(this);
        this.layers = new Layers(this);

        this.initCSS();

        this.setupEventListeners();

        this.gutter.init();
        this.layers.init();
    }

    public setCSSProperties(element: HTMLElement, properties: Record<string, string>) {
        for (const [key, value] of Object.entries(properties)) {
            element.style.setProperty(key, value);
        }
    }

    /**
     +-------------------------+
     |          Logic          |
     +-------------------------+    */

    /**
     * Force focus the editor */
    focus(): void {
        this.layers.caret.focus();
    }

    /**
     * (Re-)render the view. Expensive operation, as it triggers a repaint. Consider using `update` whenever possible*/
    render() {
        this.update();
    }

    update() {
        this.gutter.update();
        this.layers.update();
    }

    destroy() {
        this.gutter.destroy();
        this.layers.destroy();

        this.view.remove();
    }

    updateTextLayer() {
        this.layers.text.update();
        this.layers.activeLine.update();
    }

    updateCaret() {
        this.layers.caret.update();
    }

    updateSelection() {
        this.layers.selection.update();
    }

    updateActiveLine() {
        this.layers.activeLine.update();
    }

    updateGutter() {
        this.gutter.update();
    }

    /**
     * Setups the event listeners */
    private setupEventListeners() {
        this.view.addEventListener('mousedown', (e) => this.editor.fire('onMouseDown', e));
        this.view.addEventListener('mouseup', (e) => this.editor.fire('onMouseUp', e));
        this.view.addEventListener('mousemove', (e) => this.editor.fire('onMouseMove', e));
        this.view.addEventListener('wheel', (e) => this.editor.fire('onScroll', e));

        // Prevent default context menu on right click
        this.view.addEventListener('contextmenu', e => e.preventDefault());

        this.layers.setupEventListeners();
    }

    /**
     * Initialise the styling of the editor according to the `editor.properties`*/
    private initCSS() {
        const P = this.editor.properties.view || (this.editor.properties.view = {});

        function orDefault(key: string): string {
            return P[key] || (P[key] = defaults.view[key]);
        }

        this.getCharSize = _sizer(this);

        this.setCSSProperties(this.editor.root, {
            '--editor-width': px(orDefault('width')),
            '--editor-height': px(orDefault('height')),
            '--editor-root-bg': orDefault('rootBgColor'),
            '--editor-root-border-color': orDefault('rootBorderColor'),
            '--editor-font-size': px(orDefault('fontSize')),
            '--editor-line-height': px(orDefault('lineHeight')),
            '--editor-gutter-width': px(orDefault('gutterWidth')),
            '--editor-caret-height': px(orDefault('caretHeight')),
            '--editor-gutter-color': orDefault('gutterColor'),
            '--editor-caret-color': orDefault('caretColor'),
            '--editor-selection-color': orDefault('selectionColor'),
            '--editor-active-line-color': orDefault('activeLineColor'),
        });

        this.setCSSProperties(this.view, {
            '--editor-scroll-offsetY': '0',
        });

        this.gutter.initCSS();
    }
}
