import {View} from "../../ui/View";
import {Editor} from "../../Editor";
import {LogicalPosition} from "./LogicalPosition";
import {VisualPosition} from "./VisualPosition";
import {XYPoint} from "./XYPoint";
import {InlayManager} from "../inlay/InlayManager";

export class EditorCoordinateMapper {
    private readonly editor: Editor;
    private readonly inlayManager: InlayManager;

    constructor(private view: View) {
        this.editor = view.editor;
        this.inlayManager = this.editor.getInlayManager();
    }

    inlayAwareOffsetToLogical(offset: Offset): LogicalPosition {
        const inlays = this.inlayManager.getInlays();
        for (let inlay of inlays) {
            if (offset > inlay.offset) {
                offset -= inlay.deltaOffset;
            } else {
                break;
            }
        }
        return this.offsetToLogical(offset);
    }

    offsetToLogical(offset: Offset): LogicalPosition {
        const document = this.editor.getOpenedDocument();
        const line = document.getLineAt(offset);
        return new LogicalPosition(offset - line.getStart(), line.getLineNumber());
    }

    offsetToVisual(offset: Offset): VisualPosition {
        return this.logicalToVisual(this.offsetToLogical(offset));
    }

    offsetToXY(offset: Offset): XYPoint {
        return this.logicalToXY(this.offsetToLogical(offset));
    }

    logicalToOffset(pos: LogicalPosition): Offset {
        const document = this.editor.getOpenedDocument();
        const line = document.getLineData(pos.row);
        return line.getStart() + pos.col;
    }

    logicalToVisual(pos: LogicalPosition): VisualPosition {
        return new VisualPosition(pos.col, pos.row);
    }

    logicalToXY(pos: LogicalPosition): XYPoint {
        return this.visualToXY(this.logicalToVisual(pos));
    }

    visualToOffset(pos: VisualPosition): Offset {
        return this.logicalToOffset(this.visualToLogical(pos));
    }

    visualToLogical(pos: VisualPosition): LogicalPosition {
        return new LogicalPosition(pos.col, pos.row);
    }

    visualToXY(pos: VisualPosition): XYPoint {
        const charSize = this.view.getCharSize();
        const lineHeight = this.view.getLineHeight();

        const scrollYLines = this.view.scroll.scrollYOffset === 0 ? this.view.scroll.scrollYLines : this.view.scroll.scrollYLines - 1;

        const visualX = (pos.col - this.view.scroll.scrollXChars) * charSize - this.view.scroll.scrollXOffset;
        const visualY = (pos.row - scrollYLines) * lineHeight - this.view.scroll.scrollYOffset;

        return new XYPoint(visualX, visualY);
    }

    xyToNearestVisual(point: XYPoint): VisualPosition {
        const charSize = this.view.getCharSize();
        const lineHeight = this.view.getLineHeight();

        const scrollXChars = this.view.scroll.scrollXOffset === 0 ? this.view.scroll.scrollXChars : this.view.scroll.scrollXChars - 1;
        const scrollYLines = this.view.scroll.scrollYOffset === 0 ? this.view.scroll.scrollYLines : this.view.scroll.scrollYLines - 1;

        const visualX = Math.round((point.x + this.view.scroll.scrollXOffset) / charSize) + scrollXChars;
        const visualY = Math.floor((point.y + this.view.scroll.scrollYOffset) / lineHeight) + scrollYLines;

        return new VisualPosition(visualX, visualY);
    }

    xyToLogical(point: XYPoint): LogicalPosition {
        return this.visualToLogical(this.xyToNearestVisual(point));
    }
}