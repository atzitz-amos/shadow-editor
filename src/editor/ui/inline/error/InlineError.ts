import {TextRange} from "../../../core/coordinate/TextRange";
import {OverlayWidget} from "../overlay/OverlayWidget";
import {Overlay} from "../overlay/Overlay";
import {Editor} from "../../../Editor";
import {PopupFactory} from "../../popups/PopupFactory";

/**
 *
 * @author Atzitz Amos
 * @date 10/24/2025
 * @since 1.0.0
 */
export class InlineError extends OverlayWidget {
    private overlay: Overlay | null = null;

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
    }

    init(overlay: Overlay): void {
        this.overlay = overlay;

        overlay.whenHoveredWithDelay(600, (event) => {
            PopupFactory.createTooltipPopup(event.getEditor(), this.message, event.getXY(), event.getBounds());
        }, true);
    }
}
