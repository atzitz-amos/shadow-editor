import {PopupBuilder} from "./PopupBuilder";
import {Overlay} from "../../inline/widget/overlay/Overlay";
import {Editor} from "../../../Editor";
import {EditorInlinePopupFrame} from "./EditorInlinePopupFrame";

/**
 * Popup shown while hovering an {@link Overlay}, hidden again when the mouse leaves both the
 * overlay and the popup - unless the user has started interacting with the popup's contents, in
 * which case it falls back to the frame's default outside-click/Escape closing.
 *
 * @author Atzitz Amos
 * @date 6/1/2026
 * @since 1.0.0
 */
export class HoverPopupFrame extends EditorInlinePopupFrame {
    private overlay: Overlay | null = null;
    private lastHoverEvent: MouseEvent | null = null;
    private locked = false;

    public constructor(builder: PopupBuilder) {
        super(builder);
    }

    public attachToOverlay(overlay: Overlay): HoverPopupFrame {
        if (this.overlay !== null) {
            throw new Error("Hover popup is already attached to an overlay");
        }
        this.overlay = overlay;

        overlay.whenMouseOver(event => {
            if (this.disposed || this.isWithinOverlay(event.getEvent().relatedTarget)) {
                return;
            }
            this.lastHoverEvent = event.getEvent();
            this.scheduleShow();
        });

        overlay.whenMouseOut(event => {
            if (this.disposed || this.isWithinOverlay(event.getEvent().relatedTarget) ||
                this.isWithinPopup(event.getEvent().relatedTarget)) {
                return;
            }
            this.hide();
        });

        return this;
    }

    protected getEditor(): Editor {
        return this.overlay!.getEditor();
    }

    protected computeAnchor(layerBounds: DOMRect): { x: number; top: number; bottom: number } {
        const overlay = this.overlay!;
        const event = this.lastHoverEvent!;
        const overlayElement = overlay.getUnderlyingView().getElementsAt(event.x, event.y)[0];
        const overlayBounds = overlayElement?.getBoundingClientRect() ?? overlay.getUnderlyingView().getBBox();

        // Mouse events and getBoundingClientRect() are in client (viewport) coordinates; convert
        // into the popup layer's own local coordinate space.
        return {
            x: event.x - layerBounds.left,
            top: overlayBounds.top - layerBounds.top,
            bottom: overlayBounds.bottom - layerBounds.top,
        };
    }

    protected onPopupOpened(popupElement: HTMLElement): void {
        popupElement.addEventListener("mouseover", this.onPopupMouseOver);
        popupElement.addEventListener("mouseout", this.onPopupMouseOut);
        popupElement.addEventListener("mousedown", this.onPopupInternalMouseDown);
    }

    protected onPopupClosed(): void {
        this.locked = false;
    }

    private readonly onPopupMouseOver = (event: MouseEvent): void => {
        if (this.isWithinPopup(event.relatedTarget)) {
            return;
        }
        this.cancelShow();
    };

    private readonly onPopupMouseOut = (event: MouseEvent): void => {
        if (this.locked) {
            return;
        }
        if (!this.isWithinPopup(event.relatedTarget) && !this.isWithinOverlay(event.relatedTarget)) {
            this.hide();
        }
    };

    private readonly onPopupInternalMouseDown = (): void => {
        // Once the user interacts with the popup's contents, stop treating mouse movement as a
        // signal to close it - from here on only an outside click or Escape dismisses it.
        this.locked = true;
    };

    private isWithinOverlay(target: EventTarget | null): boolean {
        return target instanceof Node && this.overlay !== null &&
            this.overlay.getUnderlyingView().getAssociatedElements().some(element => element.contains(target));
    }
}