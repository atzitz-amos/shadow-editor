import {HighlightOverlay} from "./HighlightOverlay";
import {TextRange} from "../../../core/coordinate/range/TextRange";
import {Editor} from "../../../Editor";
import {TextAttributeKey} from "../style/TextAttributeKey";
import {HighlightTextEffects} from "../effects/HighlightTextEffects";

/**
 *
 * @author Atzitz Amos
 * @date 8/2/2026
 * @since 1.0.0
 */
export class EditorHighlighterUtils {
    private static readonly overlayMap: Map<string, HighlightOverlay[]> = new Map<string, HighlightOverlay[]>();

    public static highlight(editor: Editor,
                            key: string,
                            style: TextAttributeKey,
                            effects: HighlightTextEffects | null,
                            ...ranges: TextRange[]): HighlightOverlay[] {

        this.clear(key, editor);

        const overlays: HighlightOverlay[] = [];
        for (const range of ranges) {
            const overlay = new HighlightOverlay(range, style, effects);
            overlays.push(overlay)
            editor.getWidgetManager().addOverlayWidget(overlay);
        }

        this.overlayMap.set(key, overlays);
        editor.getView().triggerOverlaysRepaint();
        return overlays;
    }

    public static clear(key: string, editor: Editor) {
        if (this.overlayMap.has(key)) {
            for (const overlay of this.overlayMap.get(key)!) {
                overlay.destroy(editor);
            }
        }
    }
}
