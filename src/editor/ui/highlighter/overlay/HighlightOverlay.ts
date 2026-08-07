import {TrackedRange} from "../../../core/coordinate/range/TrackedRange";
import {Editor} from "../../../Editor";
import {Overlay} from "../../inline/widget/overlay/Overlay";
import {OverlayWidget} from "../../inline/widget/overlay/OverlayWidget";
import {TextAttributeKey} from "../style/TextAttributeKey";
import {TextRange} from "../../../core/coordinate/range/TextRange";
import {HighlightTextEffects} from "../effects/HighlightTextEffects";

/**
 *
 * @author Atzitz Amos
 * @date 6/26/2026
 * @since 1.0.0
 */
export class HighlightOverlay extends OverlayWidget {
    private readonly range: TrackedRange;

    private readonly effects: HighlightTextEffects | null = null;

    private readonly textStyle: TextAttributeKey;

    public constructor(range: TextRange, textStyle: TextAttributeKey, effects: HighlightTextEffects | null = null) {
        super();

        this.range = TrackedRange.of(range);
        this.textStyle = textStyle;
        this.effects = effects?.clone() ?? null;
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
        overlay.style(this.textStyle, this.effects);
    }
}
