import {TrackedRange} from "../../../core/coordinate/range/TrackedRange";
import {Editor} from "../../../Editor";
import {Overlay} from "../widget/overlay/Overlay";
import {OverlayWidget} from "../widget/overlay/OverlayWidget";
import {TextRange} from "../../../core/coordinate/range/TextRange";

/**
 *
 * @author Atzitz Amos
 * @date 9/28/2026
 * @since 1.0.0
 */
export class LiveTemplateOverlay extends OverlayWidget {
    private readonly range: TrackedRange;

    constructor(range: TextRange, private readonly withBorder: boolean = true) {
        super();
        this.range = new TrackedRange(range.getStart(), range.getEnd(), true, true);
    }

    getName(): string {
        return "live-template"
    }

    getRange(): TrackedRange {
        return this.range;
    }

    getClassList(): string[] {
        return ["live-template-overlay", this.withBorder ? "live-template-border" : ""];
    }

    destroy(editor: Editor): void {
    }

    init(overlay: Overlay): void {
        const width = overlay.getUnderlyingView().getCommonStylesheet().width;
        let newWidth = width.substring(0, width.length - 2);
        newWidth = (parseInt(newWidth) + 3) + "px";
        overlay.getUnderlyingView().getCommonStylesheet().width = newWidth;
    }
}
