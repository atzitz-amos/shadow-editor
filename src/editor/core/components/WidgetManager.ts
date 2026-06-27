import {TextRange} from "../coordinate/range/TextRange";
import {GutterComponent} from "../../ui/gutter/components/GutterComponent";
import {GutterLine} from "../../ui/gutter/components/GutterLine";
import {Editor} from "../../Editor";
import {WidgetRenderer} from "./WidgetRenderer";
import {HighlightHolder} from "../../ui/highlighter/HighlightHolder";
import {OverlayWidget} from "../../ui/inline/widget/overlay/OverlayWidget";
import {InlayWidget} from "../../ui/inline/widget/inlay/InlayWidget";


/**
 * Store the ranges of the components*/
export class WidgetManager {
    private overlays: OverlayWidget[] = [];
    private inlays: InlayWidget[] = [];
    private gutterComponents: GutterComponent[] = [];

    private readonly renderer: WidgetRenderer;
    private readonly highlightsHolder: HighlightHolder;

    constructor(private readonly editor: Editor) {

        this.renderer = new WidgetRenderer(this);

        this.highlightsHolder = new HighlightHolder(editor);
    }

    getAssociatedGutterComponents(line: number) {
        return [new GutterLine(line) as GutterComponent].concat(this.gutterComponents.filter(c => c.line === line));
    }

    addGutterComponent(component: GutterComponent) {
        this.gutterComponents.push(component);
    }

    getAllOverlays(): OverlayWidget[] {
        this.cleanupStaleOverlays();
        return this.overlays;
    }

    addOverlayWidget(widget: OverlayWidget) {
        this.overlays.push(widget);
        this.editor.getOpenedDocument().addTrackedRange(widget.getRange());
    }

    getInlays() {
        return this.inlays;
    }

    addInlayWidget(inlay: InlayWidget) {
        this.inlays.push(inlay);
        this.editor.getInlayManager().addInlayWidget(inlay);
    }

    * getInlaysInRange(range: TextRange) {
        for (let inlay of this.inlays) {
            if (range.intersects(inlay.getRange())) {
                yield inlay;
            }
        }
    }

    clearRange(range: TextRange) {
        let newOverlays: OverlayWidget[] = [], newGutterComponents: GutterComponent[] = [];

        for (let overlay of this.overlays) {
            if (overlay.getRange().intersects(range)) {
                overlay.destroy(this.editor);
            } else {
                newOverlays.push(overlay);
            }
        }

        for (let component of this.gutterComponents) {
            let begin = this.editor.offsetToLogical(range.start);
            let end = this.editor.offsetToLogical(range.end);
            if (component.line >= begin.row && component.line <= end.row) {
                component.onDestroy(this.editor);
            } else {
                newGutterComponents.push(component)
            }
        }

        this.overlays = newOverlays;
        this.gutterComponents = newGutterComponents;
    }

    getEditor() {
        return this.editor;
    }

    getInlayManager() {
        return this.editor.getInlayManager();
    }

    getDocument() {
        return this.editor.getOpenedDocument();
    }

    getRenderer(): WidgetRenderer {
        return this.renderer;
    }

    getHighlightsHolder() {
        return this.highlightsHolder;
    }

    clearAllOverlays() {
        for (let overlay of this.overlays) {
            overlay.destroy(this.editor);
        }
        this.overlays = [];
    }

    removeByName(name: string) {
        let newOverlays: OverlayWidget[] = [];
        for (let overlay of this.overlays) {
            if (overlay.getName() === name) {
                overlay.destroy(this.editor);
            } else {
                newOverlays.push(overlay);
            }
        }
        this.overlays = newOverlays;
    }

    private cleanupStaleOverlays() {
        let newOverlays: OverlayWidget[] = [];
        for (let overlay of this.overlays) {
            if (overlay.getRange().isValid()) {
                newOverlays.push(overlay);
            } else {
                overlay.destroy(this.editor);
            }
        }
        this.overlays = newOverlays;
    }
}
