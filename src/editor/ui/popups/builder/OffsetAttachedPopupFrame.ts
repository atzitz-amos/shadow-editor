import {PopupBuilder} from "./PopupBuilder";
import {Editor} from "../../../Editor";
import {EditorInlinePopupFrame} from "./EditorInlinePopupFrame";

/**
 * Popup anchored to a specific offset in the editor. Like {@link HoverPopup}, it has no hover
 * trigger: once attached it stays open until the user clicks outside it or presses Escape - both
 * handled by {@link EditorInlinePopupFrame}'s default behavior.
 *
 * @author Atzitz Amos
 * @date 6/1/2026
 * @since 1.0.0
 */
export class OffsetAttachedPopupFrame extends EditorInlinePopupFrame {
    private offset: number | null = null;

    public constructor(private readonly editor: Editor, builder: PopupBuilder) {
        super(builder);
        // There's no hover trigger to fall back on, so Escape needs to be able to close this popup
        // out of the box.
        this.captureFocus();
    }

    /**
     * Anchors and opens the popup over `offset`. Throws if already attached; call {@link detach}
     * first to reuse this instance for a different offset.
     */
    public attachToOffset(offset: number): OffsetAttachedPopupFrame {
        if (this.offset !== null) {
            throw new Error("Offset attached popup is already attached to an offset");
        }
        this.offset = offset;
        this.show();
        return this;
    }

    /**
     * Closes the popup (if open) and clears the attachment, allowing {@link attachToOffset} to be
     * called again on this instance.
     */
    public detach(): void {
        this.offset = null;
        this.hide();
    }

    protected getEditor(): Editor {
        return this.editor;
    }

    protected computeAnchor(): { x: number; top: number; bottom: number } {
        // Already expressed in the popup layer's own local coordinate space, so there's no
        // layerBounds-based conversion needed here (unlike HoverPopup).
        const {x, y} = this.editor.getCoordinateMapper().offsetToXY(this.offset!);
        const lineHeight = this.editor.getView().getLineHeight();

        return {x, top: y, bottom: y + lineHeight};
    }
}