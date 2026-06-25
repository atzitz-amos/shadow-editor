import {View} from "./View";
import {WidgetManager} from "../../core/components/WidgetManager";
import {WidgetRenderer} from "../../core/components/WidgetRenderer";
import {Gutter} from "../gutter/Gutter";
import {ViewLayers} from "./ViewLayers";
import {EditorScrollBar} from "../scrollbar/ScrollBar";
import {HTMLUtils} from "../../utils/HTMLUtils";
import {OverlayWidget} from "../inline/widget/overlay/OverlayWidget";

/**
 * Responsible for painting the view of the editor when content is changed or updated.
 *
 * @author Atzitz Amos
 * @date 10/26/2025
 * @since 1.0.0
 */
export class ViewPainter {

    private readonly widgetsManager: WidgetManager;
    private readonly componentsRenderer: WidgetRenderer;

    private readonly gutter: Gutter;
    private readonly layers: ViewLayers;
    private readonly scrollBar: EditorScrollBar;

    constructor(private view: View) {
        this.widgetsManager = view.getEditor().getWidgetManager();
        this.componentsRenderer = this.widgetsManager.getRenderer();

        this.gutter = new Gutter(view);
        this.layers = new ViewLayers(view);
        this.scrollBar = new EditorScrollBar(view);
    }

    repaint() {
        let scrollLines = this.view.getScroll().scrollYLines;
        let scrollOffset = this.view.getScroll().scrollYOffset;

        let data = this.componentsRenderer.renderNLines(scrollLines, this.view.getVisualLineCount());

        for (let i = 0; i < this.view.getVisualLineCount(); i++) {
            this.layers.getTextLayer().renderLine(i, data[i].content);
            this.gutter.renderLine(i, data[i].gutter);
        }

        this.gutter.nDigits = Math.floor(Math.log10(this.view.getEditor().getLineCount())) + 1

        this.layers.getTextLayer().renderEdgeLine(1, []);
        this.gutter.renderEdgeLine(1, []);
        this.layers.getTextLayer().renderEdgeLine(0, []);
        this.gutter.renderEdgeLine(0, []);

        if (scrollOffset) {
            if (scrollLines > 0) {
                let line = this.componentsRenderer.renderLine(scrollLines - 1);
                this.layers.getTextLayer().renderEdgeLine(0, line.content);
                this.gutter.renderEdgeLine(0, line.gutter);

                data.unshift(line);
            }
            if (scrollLines + this.view.getVisualLineCount() < this.view.getEditor().getLineCount()) {
                let line = this.componentsRenderer.renderLine(scrollLines + this.view.getVisualLineCount());

                this.layers.getTextLayer().renderEdgeLine(1, line.content);
                this.gutter.renderEdgeLine(1, line.gutter);

                data.push(line);
            }
        }
        this.view.setCSSProperties(this.view.view, {"--editor-scroll-offsetY": HTMLUtils.px(scrollOffset || this.view.getLineHeight())});
        this.view.setCSSProperties(this.view.view, {"--editor-scroll-x": HTMLUtils.px(this.view.getScroll().scrollX)});
    }

    repaintOverlays() {
        const document = this.view.getEditor().getOpenedDocument();
        const overlays = this.widgetsManager.getAllOverlays();

        for (const overlay of overlays) {
            const range = overlay.getRange();
            if (!range.isValid()) continue;

            const spans: HTMLSpanElement[] = [];

            let start = document.getLineStart(range.start);
            let elementStart = range.start - start;

            const initialStart = start;

            if (range.start == range.end) {
                // virtual overlay, render it as a single char wide element
                let element = this.painVirtualOverlay(overlay, range.start, elementStart);
                overlay.internalInit(this.view.getEditor(), [element]);

                let line = document.getLineAt(range.start);
                if (!line) continue;
                const lineNo = line.getLineNumber();

                if (lineNo >= this.view.getScroll().scrollYLines - 1 && lineNo < this.view.getScroll().scrollYLines + 1 + this.view.getVisualLineCount()) {
                    this.layers.getOverlayLayer().addOverlayOnLine(lineNo - this.view.getScroll().scrollYLines + 1, element);
                }
            } else if (range.end <= document.getTotalDocumentLength()) {
                while (start < range.end) {
                    let end = document.getLineEnd(start);

                    let line = document.getLineAt(start);
                    if (!line) break;
                    const lineNo = line.getLineNumber();
                    if (lineNo >= this.view.getScroll().scrollYLines - 1 && lineNo < this.view.getScroll().scrollYLines + 1 + this.view.getVisualLineCount()) {
                        const isFirstLine = (start === initialStart);
                        const isLastLine = (range.end <= end);
                        const isFullLine = overlay.fullLineInBetween() && !isFirstLine && !isLastLine;

                        let element = this.paintOverlay(
                            overlay,
                            start,
                            elementStart,
                            Math.min(range.end, end) - start,
                            isFullLine);
                        spans.push(element);

                        this.layers.getOverlayLayer().addOverlayOnLine(lineNo - this.view.getScroll().scrollYLines + 1, element);
                    }
                    start = end + 1;
                    elementStart = 0;
                }

                if (spans.length > 0) {
                    overlay.internalInit(this.view.getEditor(), spans);
                }
            }
        }

        this.layers.getOverlayLayer().renderAndClear();
    }

    notifyResize() {
        this.layers.getTextLayer().notifyResize();
        this.layers.getOverlayLayer().notifyResize()
        this.gutter.notifyResize();
    }

    init() {
        this.gutter.init();
        this.layers.init();
        this.scrollBar.render();
    }

    getLayers(): ViewLayers {
        return this.layers;
    }

    getGutter(): Gutter {
        return this.gutter;
    }

    getScrollBar() {
        return this.scrollBar;
    }

    private paintOverlay(overlay: OverlayWidget, offset: number, start: number, end: number, isFullLine: boolean): HTMLSpanElement {
        const span = HTMLUtils.createElement<HTMLSpanElement>("span.overlay-widget");
        span.classList.add(...overlay.getClassList());
        span.style.zIndex = overlay.getDrawPriority().toString();

        if (isFullLine) {
            span.style.left = HTMLUtils.px(0);
            span.style.width = HTMLUtils.px(this.view.getViewWidth());
        } else {
            let width = end - start;
            if (start == 0) {
                span.style.left = HTMLUtils.px(0);
                span.style.width = HTMLUtils.px(width * this.view.getCharSize() + 2);
            } else {
                span.style.left = HTMLUtils.px(this.view.getCharSize() * start + 2);
                span.style.width = HTMLUtils.px(width * this.view.getCharSize());
            }
        }

        span.dataset["start"] = (offset + start).toString();
        span.dataset["end"] = (offset + end).toString();

        return span;
    }

    private painVirtualOverlay(overlay: OverlayWidget, offset: number, start: number): HTMLSpanElement {
        const span = HTMLUtils.createElement<HTMLSpanElement>("span.overlay-widget");
        span.classList.add(...overlay.getClassList());
        span.style.zIndex = overlay.getDrawPriority().toString();

        span.style.left = HTMLUtils.px(this.view.getCharSize() * start);
        span.style.width = HTMLUtils.px(this.view.getCharSize());

        span.dataset["start"] = (offset).toString();
        span.dataset["end"] = (offset).toString();

        return span;

    }
}
