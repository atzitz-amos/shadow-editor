import {TextRange} from "../../../editor/core/coordinate/range/TextRange";
import {Editor} from "../../../editor/Editor";
import {Overlay} from "../../../editor/ui/inline/widget/overlay/Overlay";
import {OverlayWidget} from "../../../editor/ui/inline/widget/overlay/OverlayWidget";
import {TrackedRange} from "../../../editor/core/coordinate/range/TrackedRange";

/**
 *
 * @author Atzitz Amos
 * @date 6/3/2026
 * @since 1.0.0
 */
export class AstOverlayHighlight extends OverlayWidget {
    private readonly range: TrackedRange;

    public constructor(range: TextRange) {
        super();
        this.range = TrackedRange.of(range);
    }

    getName(): string {
        return "ast-viewer-hover-highlight";
    }

    getRange(): TrackedRange {
        return this.range;
    }

    getClassList(): string[] {
        return ["ast-viewer-overlay-highlight"];
    }

    fullLineInBetween(): boolean {
        return true;
    }

    destroy(editor: Editor): void {
        this.range.invalidate();
    }

    init(overlay: Overlay): void {

    }

}
