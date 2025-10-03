import {Editor} from "../Editor";
import {Layers} from "./Layers";
import {Gutter} from "./gutter/Gutter";
import {AbstractEditorEventListener, AbstractVisualEventListener} from "../core/events/events";

import {defaults} from "../Properties";
import {HTMLUtils} from "../utils/HTMLUtils";
import {Scrolling, ScrollMode} from "./Scroll";
import {Caret} from "../core/Caret";
import {Popup} from "./components/inline/popup/Popup";
import {EDAC, EditorComponentsRenderer} from "../core/components/EditorComponentsRenderer";
import {LogicalPosition} from "../core/coordinate/LogicalPosition";
import {VisualPosition} from "../core/coordinate/VisualPosition";
import {EditorScrollBar} from "./scrollbar/ScrollBar";
import {Document} from "../core/document/Document";


function _sizer(view: View) {
    let sizer = HTMLUtils.createElement("div.editor-sizer", view.view);
    sizer.innerHTML = "a";

    return () => sizer.getBoundingClientRect().width;
}

export class View {
    editor: Editor;

    componentRenderer: EditorComponentsRenderer;

    view: HTMLDivElement;

    scroll: Scrolling;

    gutter: Gutter;
    layers: Layers;
    scrollBar: EditorScrollBar;

    // Properties
    getCharSize: () => number;
    getLineHeight: () => number;
    getViewWidth: () => number;
    getViewHeight: () => number;

    visualLineCount: number;
    visualCharCount: number;

    // Data
    popups: Popup[] = [];
    lines: EDAC[];

    isDirty: boolean = true;

    constructor(editor: Editor) {
        this.editor = editor;
        this.componentRenderer = editor.getComponentManager().getRenderer();

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

            onMouseMove(editor: Editor, event: MouseEvent) {
                for (let popup of editor.view.popups) {
                    if (!popup.isInBound(event.x, event.y)) {
                        popup.close();
                    }
                }
            }

            onScroll(editor: Editor, event: WheelEvent) {
                event.preventDefault();
                editor.view.scrollBy(event.deltaX, event.deltaY);
                editor.view.resetBlink();
            }
        });
        this.editor.addEditorEventListener(new class extends AbstractEditorEventListener {
            onCaretMove(editor: Editor, caret: Caret, oldPos: LogicalPosition, newPos: LogicalPosition) {
                editor.view.ensureCaretVisible();
            }

            onDocumentModified(editor: Editor, document: Document) {
                for (let popup of editor.view.popups) {
                    popup.close();
                }
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
        this.scrollBar = new EditorScrollBar(this);

        this.initCSS();

        this.setupEventListeners();

        this.gutter.init();
        this.layers.init();
        this.scrollBar.render();
    }

    public setCSSProperties(element: HTMLElement, properties: Record<string, string>) {
        for (const [key, value] of Object.entries(properties)) {
            element.style.setProperty(key, value);
        }
    }

    /**
     * Force focus the editor */
    focus(): void {
        this.layers.caret.focus();
    }

    scrollBy(deltaX: number, deltaY: number) {
        let newDeltaX = this.scroll.scrollX + deltaX / 2;
        if (newDeltaX < 0) {
            this.scroll.scrollX = 0;
        } else if (newDeltaX > (this.editor.getOpenedDocument().getMaxLengthLine() - this.visualCharCount + 2) * this.getCharSize()) {
            this.scroll.scrollX = Math.max(0, (this.editor.getOpenedDocument().getMaxLengthLine() - this.visualCharCount + 2) * this.getCharSize());
        } else {
            this.scroll.scrollX = newDeltaX;
        }

        let newDeltaY = this.scroll.scrollY + deltaY;
        if (newDeltaY < 0) {
            this.scroll.scrollY = 0;
        } else if (newDeltaY > (this.editor.getLineCount() - this.visualLineCount + 2) * this.getLineHeight()) {
            this.scroll.scrollY = Math.max(0, (this.editor.getLineCount() - this.visualLineCount + 2) * this.getLineHeight());
        } else {
            this.scroll.scrollY = newDeltaY;
        }

        this.triggerRepaint();
    }

    scrollIntoView(position: LogicalPosition, mode: ScrollMode) {
        let scrollX = this.scrollIntoViewAlong(position.col, this.scroll.scrollXChars, this.scroll.scrollXChars + this.visualCharCount - 1);
        let scrollY = this.scrollIntoViewAlong(position.row, this.scroll.scrollYLines, this.scroll.scrollYLines + this.visualLineCount - 1);
        if (scrollX !== null) {
            this.scroll.scrollX = scrollX * this.getCharSize();
        }
        if (scrollY !== null) {
            this.scroll.scrollY = scrollY * this.getLineHeight();
        }

        this.triggerRepaint();
    }

    ensureCaretVisible() {
        if (this.offScreen(this.editor.getPrimaryCaret().getVisual()))
            this.scrollIntoView(this.editor.getPrimaryCaret().getLogical(), ScrollMode.Smooth);
    }

    /**
     +-------------------------+
     |          Logic          |
     +-------------------------+    */

    getMaxHeight() {
        const lineCount = Math.max(this.editor.getLineCount() + 2, this.visualLineCount);
        return lineCount * this.getLineHeight();
    }

    getMaxWidth() {
        const maxLineLength = Math.max(this.editor.getOpenedDocument().getMaxLengthLine(), this.visualCharCount);
        return maxLineLength * this.getCharSize();
    }

    getRelativePos(event: MouseEvent) {
        let x = event.clientX - this.layers.layers_el.getBoundingClientRect().left;
        let y = event.clientY - this.layers.layers_el.getBoundingClientRect().top;
        return [x, y];
    }

    /**
     * (Re-)render the view. Expensive operation, as it triggers a repaint. Consider using `update` whenever possible*/
    render() {
        if (this.isDirty) {
            this.isDirty = false;
            this.repaint();
        }

        this.update();
    }

    repaint() {
        let scrollLines = this.scroll.scrollYLines;
        let scrollOffset = this.scroll.scrollYOffset;

        let data = this.lines = this.componentRenderer.renderNLines(scrollLines, this.visualLineCount);

        for (let i = 0; i < this.visualLineCount; i++) {
            this.layers.text.renderLine(i, data[i].content);
            this.gutter.renderLine(i, data[i].gutter);
        }

        this.gutter.nDigits = Math.floor(Math.log10(this.editor.getLineCount())) + 1

        if (scrollOffset) {
            if (scrollLines > 0) {
                let line = this.componentRenderer.renderLine(scrollLines - 1);
                this.layers.text.renderEdgeLine(0, line.content);
                this.gutter.renderEdgeLine(0, line.gutter);

                this.lines.unshift(line);
            }
            if (scrollLines + this.visualLineCount < this.editor.getLineCount()) {
                let line = this.componentRenderer.renderLine(scrollLines + this.visualLineCount);

                this.layers.text.renderEdgeLine(1, line.content);
                this.gutter.renderEdgeLine(1, line.gutter);

                this.lines.push(line);
            }
        }
        this.setCSSProperties(this.view, {"--editor-scroll-offsetY": HTMLUtils.px(scrollOffset || this.getLineHeight())});
        this.setCSSProperties(this.view, {"--editor-scroll-x": HTMLUtils.px(this.scroll.scrollX)});
    }

    triggerRepaint() {
        this.isDirty = true;
    }

    update() {
        this.gutter.update();
        this.layers.update();
        this.scrollBar.update();
    }

    destroy() {
        this.gutter.destroy();
        this.layers.destroy();

        this.view.remove();
    }

    addPopup(popup: Popup) {
        let element = popup.render(this);
        this.layers.layers_el.appendChild(element);

        this.popups.push(popup);
    }

    showPopup(popup: Popup, sourceX: number, sourceY: number) {
        let element = popup.element;

        popup.show();

        let topX = this.layers.layers_el.getBoundingClientRect().left;
        let topY = this.layers.layers_el.getBoundingClientRect().top;

        let x = sourceX - topX;
        let y = Math.ceil((sourceY - topY) / this.getLineHeight()) * this.getLineHeight();

        element.style.left = HTMLUtils.px(x);
        element.style.top = HTMLUtils.px(y);
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

    offScreen(pos: VisualPosition): boolean {
        let visual = this.editor.visualToXY(pos);
        return visual.x < 0 || visual.x >= this.getViewWidth() || visual.y < 0 || visual.y >= this.getViewHeight();
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
        this.getViewWidth = () => P.width!;
        this.getViewHeight = () => P.height!;
        this.visualLineCount = Math.floor(P.height! / this.getLineHeight())
        setTimeout(() => {
            this.visualCharCount = Math.floor(this.layers.layers_el.getBoundingClientRect().width / this.getCharSize())
        }, 100);

        this.setCSSProperties(this.view, {
            '--editor-scroll-offsetY': HTMLUtils.px(this.getLineHeight()),
        });

        this.gutter.initCSS();
    }
}
