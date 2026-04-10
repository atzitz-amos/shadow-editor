import {Editor} from "../../Editor";
import {HTMLUtils} from "../../utils/HTMLUtils";
import {Scrolling, ScrollMode} from "../scrollbar/Scroll";
import {RenderedLineData} from "../../core/components/WidgetRenderer";
import {LogicalPosition} from "../../core/coordinate/LogicalPosition";
import {VisualPosition} from "../../core/coordinate/VisualPosition";
import {CaretMovedEvent} from "../../core/caret/events/CaretMovedEvent";
import {ViewPainter} from "./ViewPainter";
import {ViewPropertiesManager} from "./properties/ViewPropertiesManager";
import {Critical} from "../../../core/critical/Critical";


export class View {
    editor: Editor;
    view: HTMLDivElement;

    myPainter: ViewPainter;

    myProperties: ViewPropertiesManager;

    scroll: Scrolling;

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

        this.editor.getEventBus().subscribe(this, CaretMovedEvent.SUBSCRIBER, () => {
            this.ensureCaretVisible();
        });
    }

    /**
     +--------------------------+
     |          Config          |
     +--------------------------+    */

    onAttached(root: HTMLElement) {
        this.view = HTMLUtils.createElement('div.editor-view', root) as HTMLDivElement;
        this.scroll = new Scrolling(this, 0, 0);

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
        } else if (newDeltaX > (this.editor.getOpenedDocument().getMaxLengthLine() - this.getVisualCharCount() + 2) * this.getCharSize()) {
            this.scroll.scrollX = Math.max(0, (this.editor.getOpenedDocument().getMaxLengthLine() - this.getVisualCharCount() + 2) * this.getCharSize());
        } else {
            this.scroll.scrollX = newDeltaX;
        }

        let newDeltaY = this.scroll.scrollY + deltaY;
        if (newDeltaY < 0) {
            this.scroll.scrollY = 0;
        } else if (newDeltaY > (this.editor.getLineCount() - this.getVisualLineCount() + 2) * this.getLineHeight()) {
            this.scroll.scrollY = Math.max(0, (this.editor.getLineCount() - this.getVisualLineCount() + 2) * this.getLineHeight());
        } else {
            this.scroll.scrollY = newDeltaY;
        }

        this.triggerRepaint();
    }

    scrollIntoView(position: LogicalPosition, mode: ScrollMode) {
        let scrollX = this.scrollIntoViewAlongX(position.col, this.scroll.scrollXChars, this.scroll.scrollXChars + this.getVisualCharCount() - 1);
        let scrollY = this.scrollIntoViewAlongY(position.row, this.scroll.scrollYLines, this.scroll.scrollYLines + this.getVisualLineCount() - 1);
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

    getEditor(): Editor {
        return this.editor;
    }

    getScroll(): Scrolling {
        return this.scroll;
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
        return this.editor.root;
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
        this.triggerRepaint();
    }

    triggerRepaint() {
        this.dirtyFlags.isDirty = true;
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
        this.setCSSProperties(this.view, {
            '--editor-scroll-offsetY': HTMLUtils.px(this.getLineHeight()),
        });

        this.myPainter.getGutter().initCSS();
    }
}
