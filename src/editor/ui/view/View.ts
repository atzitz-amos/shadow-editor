import {Editor} from "../../Editor";
import {HTMLUtils} from "../../utils/HTMLUtils";
import {Scrolling, ScrollMode} from "../scrollbar/Scrolling";
import {RenderedLineData} from "../../core/components/WidgetRenderer";
import {LogicalPosition} from "../../core/coordinate/LogicalPosition";
import {VisualPosition} from "../../core/coordinate/VisualPosition";
import {CaretMovedEvent} from "../../core/caret/events/CaretMovedEvent";
import {ViewPainter} from "./ViewPainter";
import {ViewPropertiesManager} from "./properties/ViewPropertiesManager";
import {Critical} from "../../../core/critical/Critical";
import {XYPoint} from "../../core/coordinate/XYPoint";
import {EditorKeyContextManager} from "../../core/keycontext/EditorKeyContextManager";
import {TextRange} from "../../core/coordinate/range/TextRange";
import {CaretMovementFlags} from "../../core/caret/Caret";
import { DocumentView } from "../../core/document/view/DocumentView";


export class View {
    editor: Editor;
    view: HTMLDivElement;

    myPainter: ViewPainter;

    myProperties: ViewPropertiesManager;

    scrolling: Scrolling;

    // Data
    lines: RenderedLineData[];


    private readonly dirtyFlags = {
        isDirty: true,
        areOverlaysDirty: true,
        isResizeDirty: false
    };


    constructor(editor: Editor) {
        this.editor = editor;
        this.myPainter = new ViewPainter(this);
        this.myProperties = new ViewPropertiesManager(this);

        this.editor.getEventBus().subscribe(this, CaretMovedEvent.SUBSCRIBER, ev => {
            if (!(ev.getMovementFlags() & CaretMovementFlags.NO_SCROLL)) this.ensureCaretVisible();
        });
    }

    /**
     +--------------------------+
     |          Config          |
     +--------------------------+    */

    onAttached(root: HTMLElement) {
        this.view = HTMLUtils.createElement('div.editor-view', root) as HTMLDivElement;

        const documentView = this.editor.getDocumentView();
        this.scrolling = new Scrolling(this, documentView.getScrollX(), documentView.getScrollY());

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
        this.scrolling.scrollBy(deltaX, deltaY)
    }

    scrollIntoView(position: LogicalPosition, mode: ScrollMode) {
        let scrollX = this.scrollIntoViewAlongX(position.col, this.scrolling.scrollXChars, this.scrolling.scrollXChars + this.getVisualCharCount() - 1);
        let scrollY = this.scrollIntoViewAlongY(position.row, this.scrolling.scrollYLines, this.scrolling.scrollYLines + this.getVisualLineCount() - 1);

        const targetX = scrollX !== null ? scrollX * this.getCharSize() : this.scrolling.scrollX;
        const targetY = scrollY !== null ? scrollY * this.getLineHeight() : this.scrolling.scrollY;

        this.scrolling.scrollTo(targetX, targetY, mode);
    }

    ensureCaretVisible() {
        if (this.offScreen(this.editor.getPrimaryCaret().getVisual()))
            this.scrollIntoView(this.editor.getPrimaryCaret().getLogical(), ScrollMode.Smooth);
    }

    getEditor(): Editor {
        return this.editor;
    }

    getScroll(): Scrolling {
        return this.scrolling;
    }

    getLayers() {
        return this.myPainter.getLayers();
    }

    getPainter(): ViewPainter {
        return this.myPainter;
    }

    getProperties(): ViewPropertiesManager {
        return this.myProperties;
    }

    getRootElement(): HTMLElement {
        return this.editor.getRootElement();
    }

    getViewElement(): HTMLDivElement {
        return this.view;
    }

    getViewWidth() {
        return this.myProperties.getWidth();
    }

    getViewHeight() {
        return this.myProperties.getHeight();
    }

    getCharSize(): number {
        return this.myProperties.getCharSize();
    }

    getLineHeight(): number {
        return this.myProperties.getLineHeight();
    }

    resize(width: number, height: number) {
        this.myProperties.setWidth(width);
        this.myProperties.setHeight(height);
    }

    getVisualLineCount(): number {
        return this.myProperties.getVisualLineCount();
    }

    getVisualCharCount(): number {
        return this.myProperties.getVisualCharCount();
    }

    getMaxWidth() {
        const maxLineLength = Math.max(this.editor.getOpenedDocument().getMaxLengthLine(), this.getVisualCharCount());
        return maxLineLength * this.getCharSize();
    }

    getMaxHeight() {
        const lineCount = Math.max(this.editor.getLineCount() + 2, this.getVisualLineCount());
        return lineCount * this.getLineHeight();
    }

    getRelativePos(event: MouseEvent) {
        let x = event.clientX - this.myPainter.getLayers().layers_el.getBoundingClientRect().left;
        let y = event.clientY - this.myPainter.getLayers().layers_el.getBoundingClientRect().top;
        return [x, y];
    }

    @Critical
    render() {
        if (this.dirtyFlags.isResizeDirty) {
            this.dirtyFlags.isResizeDirty = false;
            this.myPainter.notifyResize();
        }

        if (this.dirtyFlags.isDirty) {
            this.dirtyFlags.isDirty = false;
            this.myPainter.repaint();
        }

        if (this.dirtyFlags.areOverlaysDirty) {
            this.dirtyFlags.areOverlaysDirty = false;
            this.myPainter.repaintOverlays();
        }

        this.update();
    }

    setResizeDirty() {
        this.dirtyFlags.isResizeDirty = true;
        this.dirtyFlags.isDirty = true;
        this.dirtyFlags.areOverlaysDirty = true;
    }

    triggerRepaint() {
        this.dirtyFlags.isDirty = true;
        this.dirtyFlags.areOverlaysDirty = true;
    }

    triggerOverlaysRepaint() {
        this.dirtyFlags.areOverlaysDirty = true;
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
        return visual.x < 0 || visual.x >= this.getViewWidth() - 2 || visual.y < 0 || visual.y >= this.getViewHeight() - 2;
    }

    onBlur(event: FocusEvent): void {
        this.editor.getRootElement().classList.remove('focused');
        if (EditorKeyContextManager.isCurrent(this.editor)) EditorKeyContextManager.getInstance().unfocus();
    }

    onFocus(event: FocusEvent): void {
        this.editor.getRootElement().classList.add('focused');
        EditorKeyContextManager.getInstance().bindCurrentEditor(this.editor);
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
        this.getLayers().setNoCursor(false);
    }

    onScroll(event: WheelEvent) {
        event.preventDefault();
        this.editor.getView().scrollBy(event.deltaX, event.deltaY);
        this.editor.getView().resetBlink();
    }

    onType(e: InputEvent) {
        this.editor.onType(e);
        this.getLayers().setNoCursor(true);
    }

    onKeyDown(e: KeyboardEvent) {
        this.editor.onKeyDown(e);
    }

    onKeyUp(e: KeyboardEvent) {
        this.editor.onKeyUp(e);
    }

    getLineBoundingBox(line: number): DOMRect {
        // Calculate the bounding box of the line in the view
        // The result might be off screen (negative coordinates or coordinates larger than the view size)
        let x = -this.scrolling.scrollX;
        let y = (line - this.scrolling.scrollYLines) * this.getLineHeight();

        let xy = this.relativeToViewportCoordinates(x, y);

        return new DOMRect(xy.x, xy.y, this.getViewWidth(), this.getLineHeight());
    }

    relativeToViewportCoordinates(x: number, y: number): XYPoint {
        // Convert a point relative to the view element coordinates to viewport coordinates
        let rect = this.view.getBoundingClientRect();
        return new XYPoint(x + rect.left, y + rect.top);
    }

    maybeVisible(range: TextRange) {
        let startLine = this.editor.offsetToLogical(range.start).row;
        let endLine = this.editor.offsetToLogical(range.end).row;
        return !(endLine < this.scrolling.scrollYLines || startLine > this.scrolling.scrollYLines + this.getVisualLineCount());
    }

    private scrollIntoViewAlongX(position: number, scrollStart: number, scrollEnd: number): number | null {
        if (position > scrollStart && position < scrollEnd) {
            return null;  // Already in view
        } else if (position <= scrollStart) {
            return Math.max(0, position - 2);
        } else {
            let diff = scrollEnd - scrollStart;
            if (position + 1 >= this.editor.getOpenedDocument().getMaxLengthLine()) {
                return Math.max(0, this.editor.getOpenedDocument().getMaxLengthLine() - diff);
            }
            return Math.max(0, position - diff);
        }
    }

    private scrollIntoViewAlongY(position: number, scrollStart: number, scrollEnd: number): number | null {
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
        this.view.addEventListener('mousedown', this.onMouseDown.bind(this), false);
        this.view.addEventListener('mouseup', this.onMouseUp.bind(this), false);
        this.view.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        this.view.addEventListener('wheel', this.onScroll.bind(this), false);

        // Prevent default context menu on right click
        this.view.addEventListener('contextmenu', e => e.preventDefault());

        this.myPainter.getLayers().setupEventListeners();
    }

    /**
     * Initialize the styling of the editor according to the `editor.properties`*/
    private initCSS() {
        this.setCSSProperties(this.view, {
            '--editor-scroll-offsetY': HTMLUtils.px(this.getLineHeight()),
        });

        this.myPainter.getGutter().initCSS();
    }

    restoreFromDocumentView(view: DocumentView) {
        if (this.scrolling) {
            this.scrolling.scrollTo(view.getScrollX(), view.getScrollY(), ScrollMode.Instant);
        }
    }
}
