import {TextRange} from "../../../core/coordinate/TextRange";
import {OverlayWidget} from "../widget/overlay/OverlayWidget";
import {Overlay} from "../widget/overlay/Overlay";
import {Editor} from "../../../Editor";
import {HoverPopup} from "../../popups/builder/HoverPopup";
import {SimpleTooltipBuilder} from "../../popups/tooltip/SimpleTooltipBuilder";

/**
 *
 * @author Atzitz Amos
 * @date 10/24/2025
 * @since 1.0.0
 */
export class InlineError extends OverlayWidget {
    private overlay: Overlay | null = null;
    private hoverPopup: HoverPopup;

    constructor(private range: TextRange, private message: string) {
        super();
    }

    getRange(): TextRange {
        return this.range;
    }

    getClassList(): string[] {
        return ["error-marker"];
    }

    getName(): string {
        return "default.inline.error";
    }

    destroy(editor: Editor): void {
        if (this.overlay) {
            this.overlay.dispose();
        }
        if (this.hoverPopup) {
            console.log("disposing hover popup");
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
