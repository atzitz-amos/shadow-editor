import {TrackedRange} from "../../../../core/coordinate/range/TrackedRange";
import {Editor} from "../../../../Editor";
import {Overlay} from "./Overlay";
import {OverlayWidget} from "./OverlayWidget";
import {TextAttributeKey} from "../../../highlighter/style/TextAttributeKey";
import {TextRange} from "../../../../core/coordinate/range/TextRange";

/**
 *
 * @author Atzitz Amos
 * @date 6/26/2026
 * @since 1.0.0
 */
export class HighlightOverlay extends OverlayWidget {
    private readonly range: TrackedRange;

    public constructor(range: TextRange, private readonly textStyle: TextAttributeKey) {
        super();

        this.range = TrackedRange.of(range);
    }

    getName(): string {
        return "editor-inline-highlight"
    }

    getRange(): TrackedRange {
        return this.range;
    }

    getClassList(): string[] {
        return ["editor-inline-highlight"];
    }

    destroy(editor: Editor): void {
        this.range.invalidate();
    }

    init(overlay: Overlay): void {
        overlay.style(this.textStyle);
    }
}
