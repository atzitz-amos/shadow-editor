import {Editor} from "../Editor";
import {Layers} from "./Layers";
import {Gutter} from "./gutter/Gutter";
import {AbstractEditorEventListener, AbstractVisualEventListener} from "../core/events/events";

import {defaults} from "../Properties";
import {HTMLUtils} from "../utils/HTMLUtils";
import {Scrolling} from "./Scroll";
import {Position} from "../core/Position";
import {Caret} from "../core/Caret";


function _sizer(view) {
    let sizer = HTMLUtils.createElement("div.editor-sizer", view.view);
    sizer.innerHTML = "a";

    return () => sizer.getBoundingClientRect().width;
}

export enum ScrollMode {
    Smooth,
    Instant
}

export class View {
    editor: Editor;

    view: HTMLDivElement;

    scroll: Scrolling;
    gutter: Gutter;
    layers: Layers;

    // Properties
    getCharSize: () => number;
    getLineHeight: () => number;

    visualLineCount: number;

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

            onScroll(editor: Editor, event: WheelEvent) {
                event.preventDefault();
                let deltaY = event.deltaY;
                if (deltaY !== 0) {
                    editor.view.scrollBy(0, deltaY);
                }
                editor.view.resetBlink();
            }
        });
        this.editor.addEditorEventListener(new class extends AbstractEditorEventListener {
            onCaretMove(editor: Editor, caret: Caret, oldPos: Position, newPos: Position) {
                caret.editor.view.scrollIntoView(newPos, ScrollMode.Instant);
            }
        });
    }

    /**
     +--------------------------+
     |          Config          |
     +--------------------------+    */

    onAttached(editor: Editor, root: HTMLElement) {
        this.view = HTMLUtils.createElement('div.editor-view', root) as HTMLDivElement;

        this.scroll = new Scrolling(this, 0, 0);
        this.gutter = new Gutter(this);
        this.layers = new Layers(this);

        this.initCSS();

        this.setupEventListeners();

        this.gutter.init();
        this.layers.init();

        this.render();
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

    scrollBy(deltaX: number, deltaY: number) {
        let newDeltaY = this.scroll.scrollY + deltaY;
        if (newDeltaY < 0) {
            this.scroll.scrollY = 0;
        } else if (newDeltaY > (this.editor.getLineCount() - this.visualLineCount + 2) * this.getLineHeight()) {
            this.scroll.scrollY = Math.max(0, (this.editor.getLineCount() - this.visualLineCount + 2) * this.getLineHeight());
        } else {
            this.scroll.scrollY = newDeltaY;
        }
    }

    scrollIntoView(position: Position, mode: ScrollMode) {
        // let scrollX = this.scrollIntoViewAlong(position.x, this.scroll.scrollXChars)
        let scrollY = this.scrollIntoViewAlong(position.y, this.scroll.scrollYLines, this.scroll.scrollYLines + this.visualLineCount - 1);
        if (scrollY !== null) {
            this.scroll.scrollY = scrollY * this.getLineHeight();
        }
    }

    animateScroll(position: Position) {

    }

    getRelativePos(event: MouseEvent) {
        let x = event.clientX - this.layers.layers_el.getBoundingClientRect().left;
        let y = event.clientY - this.layers.layers_el.getBoundingClientRect().top;
        return [x, y];
    }

    /**
     * (Re-)render the view. Expensive operation, as it triggers a repaint. Consider using `update` whenever possible*/
    render() {
        let scrollLines = this.scroll.scrollYLines;
        let scrollOffset = this.scroll.scrollYOffset;


        let data = this.editor.take(this.visualLineCount, scrollLines);
        for (let i = 0; i < this.visualLineCount; i++) {
            this.layers.text.renderLine(i, data[i].content);
            this.gutter.renderLine(i, data[i].gutter);
        }

        this.gutter.digits = Math.floor(Math.log10(this.editor.getLineCount())) + 1

        if (scrollOffset) {
            if (scrollLines > 0) {
                let line = this.editor.getLine(scrollLines - 1);
                this.layers.text.renderEdgeLine(0, line.content);
                this.gutter.renderEdgeLine(0, line.gutter);
            }
            if (scrollLines + this.visualLineCount < this.editor.getLineCount()) {
                let line = this.editor.getLine(scrollLines + this.visualLineCount);

                this.layers.text.renderEdgeLine(1, line.content);
                this.gutter.renderEdgeLine(1, line.gutter);
            }
        }
        this.setCSSProperties(this.view, {"--editor-scroll-offsetY": HTMLUtils.px(scrollOffset || this.getLineHeight())});

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

    resetBlink() {
        this.layers.caret.blinkReset();
    }

    private scrollIntoViewAlong(position: number, scrollStart: number, scrollEnd: number): number | null {
        if (position > scrollStart && position < scrollEnd) {
            return null;  // Already in view
        } else if (position <= scrollStart) {
            return Math.max(0, position - 2);
        } else {
            let diff = scrollEnd - scrollStart;
            if (position + 1 >= this.editor.getLineCount()) {
                return Math.max(0, this.editor.getLineCount() - diff);
            }
            return Math.max(0, position - diff);
        }
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


        this.setCSSProperties(this.editor.root, {
            '--editor-width': HTMLUtils.px(orDefault('width')),
            '--editor-height': HTMLUtils.px(orDefault('height')),
            '--editor-root-bg': orDefault('rootBgColor'),
            '--editor-root-border-color': orDefault('rootBorderColor'),
            '--editor-font-size': HTMLUtils.px(orDefault('fontSize')),
            '--editor-line-height': HTMLUtils.px(orDefault('lineHeight')),
            '--editor-gutter-width': HTMLUtils.px(orDefault('gutterWidth')),
            '--editor-caret-height': HTMLUtils.px(orDefault('caretHeight')),
            '--editor-gutter-color': orDefault('gutterColor'),
            '--editor-caret-color': orDefault('caretColor'),
            '--editor-selection-color': orDefault('selectionColor'),
            '--editor-active-line-color': orDefault('activeLineColor'),
        });

        this.getCharSize = _sizer(this);
        this.getLineHeight = () => P.lineHeight!;
        this.visualLineCount = Math.floor(P.height! / this.getLineHeight())

        this.setCSSProperties(this.view, {
            '--editor-scroll-offsetY': HTMLUtils.px(this.getLineHeight()),
        });

        this.gutter.initCSS();
    }
}
