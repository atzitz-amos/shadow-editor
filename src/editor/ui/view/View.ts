import {Editor} from "../../Editor";
import {defaults} from "../../Properties";
import {HTMLUtils} from "../../utils/HTMLUtils";
import {Scrolling, ScrollMode} from "../scrollbar/Scroll";
import {RenderedLineData} from "../../core/components/WidgetRenderer";
import {LogicalPosition} from "../../core/coordinate/LogicalPosition";
import {VisualPosition} from "../../core/coordinate/VisualPosition";
import {CaretMovedEvent} from "../../core/caret/events/CaretMovedEvent";
import {ViewPainter} from "./ViewPainter";


function _sizer(view: View) {
    let sizer = HTMLUtils.createElement("div.editor-sizer", view.view);
    sizer.innerHTML = "a";

    return () => sizer.getBoundingClientRect().width;
}

export class View {
    editor: Editor;

    myPainter: ViewPainter;

    view: HTMLDivElement;

    scroll: Scrolling;

    // Properties
    getCharSize: () => number;
    getLineHeight: () => number;
    getViewWidth: () => number;
    getViewHeight: () => number;

    visualLineCount: number;
    visualCharCount: number;

    // Data
    lines: RenderedLineData[];

    isDirty: boolean = true;
    areOverlaysDirty: boolean = true;

    constructor(editor: Editor) {
        this.editor = editor;
        this.myPainter = new ViewPainter(this);

        this.editor.getEventBus().subscribe(this, CaretMovedEvent.SUBSCRIBER, () => {
            this.ensureCaretVisible();
        })
    }

    /**
     +--------------------------+
     |          Config          |
     +--------------------------+    */

    onAttached(editor: Editor, root: HTMLElement) {
        this.view = HTMLUtils.createElement('div.editor-view', root) as HTMLDivElement;

        this.scroll = new Scrolling(this, 0, 0);

        this.myPainter = new ViewPainter(this);

        this.initCSS();

        this.setupEventListeners();

        this.myPainter.init();
    }

    public setCSSProperties(element: HTMLElement, properties: Record<string, string>) {
        for (const [key, value] of Object.entries(properties)) {
            element.style.setProperty(key, value);
        }
    }

    /**
     * Force focus the editor */
    focus(): void {
        this.myPainter.getLayers().getCaretLayer().focus();
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
        let x = event.clientX - this.myPainter.getLayers().layers_el.getBoundingClientRect().left;
        let y = event.clientY - this.myPainter.getLayers().layers_el.getBoundingClientRect().top;
        return [x, y];
    }

    render() {
        if (this.isDirty) {
            this.isDirty = false;
            this.myPainter.repaint();
        }

        if (this.areOverlaysDirty) {
            this.areOverlaysDirty = false;
            this.myPainter.repaintOverlays();
        }

        this.update();
    }

    triggerRepaint() {
        this.isDirty = true;
        this.areOverlaysDirty = true;
    }

    update() {
        this.myPainter.getGutter().update();
        this.myPainter.getLayers().update();
        this.myPainter.getScrollBar().update();
    }

    destroy() {
        this.myPainter.getGutter().destroy();
        this.myPainter.getLayers().destroy();

        this.view.remove();
    }

    resetBlink() {
        this.myPainter.getLayers().getCaretLayer().blinkReset();
    }

    offScreen(pos: VisualPosition): boolean {
        let visual = this.editor.visualToXY(pos);
        return visual.x < 0 || visual.x >= this.getViewWidth() || visual.y < 0 || visual.y >= this.getViewHeight();
    }

    onBlur(event: FocusEvent): void {
        this.editor.root.classList.remove('focused');
    }

    onFocus(event: FocusEvent): void {
        this.editor.root.classList.add('focused');
    }

    onMouseDown(event: MouseEvent) {
        event.preventDefault();
        this.focus();

        this.editor.onMouseDown(event);
    }

    onMouseUp(event: MouseEvent) {
        this.editor.onMouseUp(event);
    }

    onMouseMove(event: MouseEvent) {
        this.editor.onMouseMove(event);
    }

    onScroll(event: WheelEvent) {
        event.preventDefault();
        this.editor.view.scrollBy(event.deltaX, event.deltaY);
        this.editor.view.resetBlink();
    }

    onInput(e: InputEvent) {
        this.editor.onInput(e);
    }

    onKeyDown(e: KeyboardEvent) {
        this.editor.onKeyDown(e);
    }

    onKeyUp(e: KeyboardEvent) {
        this.editor.onKeyUp(e);
    }

    getEditor(): Editor {
        return this.editor;
    }

    getScroll(): Scrolling {
        return this.scroll;
    }

    getLayers() {
        return this.myPainter.getLayers();
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
        this.view.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.view.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.view.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.view.addEventListener('wheel', this.onScroll.bind(this));

        // Prevent default context menu on right click
        this.view.addEventListener('contextmenu', e => e.preventDefault());

        this.myPainter.getLayers().setupEventListeners();
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
            this.visualCharCount = Math.floor(this.myPainter.getLayers().layers_el.getBoundingClientRect().width / this.getCharSize())
        }, 100);

        this.setCSSProperties(this.view, {
            '--editor-scroll-offsetY': HTMLUtils.px(this.getLineHeight()),
        });

        this.myPainter.getGutter().initCSS();
    }
}
