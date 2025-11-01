import {View} from "./View";
import {WidgetManager} from "../../core/components/WidgetManager";
import {WidgetRenderer} from "../../core/components/WidgetRenderer";
import {Gutter} from "../gutter/Gutter";
import {ViewLayers} from "./ViewLayers";
import {EditorScrollBar} from "../scrollbar/ScrollBar";
import {HTMLUtils} from "../../utils/HTMLUtils";
import {OverlayWidget} from "../inline/overlay/OverlayWidget";

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

        let data = this.componentsRenderer.renderNLines(scrollLines, this.view.visualLineCount);

        for (let i = 0; i < this.view.visualLineCount; i++) {
            this.layers.getTextLayer().renderLine(i, data[i].content);
            this.gutter.renderLine(i, data[i].gutter);
        }

        this.gutter.nDigits = Math.floor(Math.log10(this.view.getEditor().getLineCount())) + 1

        if (scrollOffset) {
            if (scrollLines > 0) {
                let line = this.componentsRenderer.renderLine(scrollLines - 1);
                this.layers.getTextLayer().renderEdgeLine(0, line.content);
                this.gutter.renderEdgeLine(0, line.gutter);

                data.unshift(line);
            }
            if (scrollLines + this.view.visualLineCount < this.view.getEditor().getLineCount()) {
                let line = this.componentsRenderer.renderLine(scrollLines + this.view.visualLineCount);

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

            const spans: HTMLSpanElement[] = [];


            if (range.end >= document.getTotalDocumentLength()) {
                console.warn("Warning: Skipping invalid overlay (" + overlay.getName() + ") because it has " +
                    "an invalid range: " + overlay.getRange().toString())
                continue;
            }

            let start = document.getLineStart(range.start);
            let elementStart = range.start - start;

            while (start <= range.end) {
                let end = document.getLineEnd(start);

                const line = document.getLineAt(start).getLineNumber();
                if (line >= this.view.getScroll().scrollYLines - 1 && line < this.view.getScroll().scrollYLines + 1 + this.view.visualLineCount) {
                    let element = this.paintOverlay(overlay, elementStart, Math.min(range.end, end) - start);
                    spans.push(element);

                    const lineNo = line - this.view.getScroll().scrollYLines + 1;
                    this.layers.getOverlayLayer().addOverlayOnLine(lineNo, element);
                }
                start = end + 1;
                elementStart = 0;
            }

            if (spans.length > 0) {
                overlay.internalInit(this.view.getEditor(), spans);
            }
        }

        this.layers.getOverlayLayer().renderAndClear();
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

    private paintOverlay(overlay: OverlayWidget, start: number, end: number): HTMLSpanElement {
        const span = HTMLUtils.createElement<HTMLSpanElement>("span.overlay-widget");
        span.classList.add(...overlay.getClassList());
        span.style.zIndex = overlay.getDrawPriority().toString();

        let width = end - start;
        span.style.left = HTMLUtils.px(this.view.getCharSize() * start);
        span.style.width = HTMLUtils.px(width * this.view.getCharSize());

        return span;
    }
}
