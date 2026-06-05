import {Overlay} from "../widget/overlay/Overlay";
import {HoverPopup} from "../../popups/builder/HoverPopup";
import {TextRange} from "../../../core/coordinate/range/TextRange";
import {Editor} from "../../../Editor";
import {SimpleTooltipBuilder} from "../../popups/tooltip/SimpleTooltipBuilder";
import {OverlayWidget} from "../widget/overlay/OverlayWidget";
import {InspectionSeverity} from "../../../../core/lang/inspections/InspectionSeverity";
import {TrackedRange} from "../../../core/coordinate/range/TrackedRange";

/**
 *
 * @author Atzitz Amos
 * @date 6/2/2026
 * @since 1.0.0
 */
export class InlineInspection extends OverlayWidget {
    private overlay: Overlay | null = null;
    private hoverPopup: HoverPopup;
    private readonly range: TrackedRange;

    constructor(range: TextRange, private severity: InspectionSeverity, private message: string) {
        super();
        this.range = TrackedRange.of(range)
    }

    getRange(): TrackedRange {
        return this.range;
    }

    getClassList(): string[] {
        return ["inline-inspection", "inspection-severity-" + this.severity];
    }

    getName(): string {
        return "inline-inspection";
    }

    destroy(editor: Editor): void {
        this.range.invalidate();
        if (this.overlay) {
            this.overlay.dispose();
        }
        if (this.hoverPopup) {
            this.hoverPopup.dispose(editor);
        }
    }

    init(overlay: Overlay): void {
        this.overlay = overlay;

        this.hoverPopup = new HoverPopup(new SimpleTooltipBuilder(this.message))
            .delayed(500)
            .setFocusCapture()
            .attachToOverlay(overlay);
    }
}
