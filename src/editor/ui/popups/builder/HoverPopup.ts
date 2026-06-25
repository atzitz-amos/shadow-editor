import {PopupBuilder} from "./PopupBuilder";
import {Overlay} from "../../inline/widget/overlay/Overlay";
import {EditorPopup} from "../EditorPopup";
import {Editor} from "../../../Editor";

/**
 *
 * @author Atzitz Amos
 * @date 6/1/2026
 * @since 1.0.0
 */
export class HoverPopup {
    private delay: number = 0;
    private focusCapture: boolean = false;

    private timeout: NodeJS.Timeout | null = null;
    private shownPopup: EditorPopup | null = null;
    private focusAcquired = false;
    private onMouseMoveEvent;

    public constructor(private builder: PopupBuilder) {
    }

    public setFocusCapture(): HoverPopup {
        this.focusCapture = true;
        return this;
    }

    public delayed(delay: number): HoverPopup {
        this.delay = delay;
        return this;
    }

    public attachToOverlay(overlay: Overlay): HoverPopup {
        overlay.whenMouseOver(e => {
            this.timeout = setTimeout(() => {
                if (this.shownPopup && this.shownPopup.isDisposed()) {
                    this.shownPopup = null
                }

                this.focusAcquired = false;


                const viewportBBox = overlay.getEditor().getView().getLayers().getPopupLayer().getBBox();
                const overlayBbox = overlay.getUnderlyingView().getElementsAt(e.getXY().x, e.getXY().y)[0].getBoundingClientRect();
                const popup = this.builder.build(overlay.getEditor());

                const popupBbox = popup.measure();

                let x = e.getXY().x;
                let y = overlayBbox.bottom + 2;

                if (y + popupBbox.height >= viewportBBox.bottom) {
                    y = overlayBbox.top - popupBbox.height + 2;
                }
                if (x + popupBbox.width >= viewportBBox.right) {
                    x = x - popupBbox.width;
                }

                if (this.shownPopup == null) {
                    popup.open(x - viewportBBox.left, y - viewportBBox.top);
                    this.shownPopup = popup;

                    if (this.focusCapture) {
                        popup.getUnderlyingElement().addEventListener("mousedown", e => {
                            e.stopPropagation();
                            popup.getUnderlyingElement().focus();
                            this.focusAcquired = true;
                        })
                    }
                } else {
                    this.shownPopup.move(x - viewportBBox.left, y - viewportBBox.top);
                }
            }, this.delay);
        });

        overlay.whenMouseOut(e => {
            if (this.timeout) clearTimeout(this.timeout)
            this.timeout = null;
        });

        this.onMouseMoveEvent = (e: MouseEvent) => {
            if (this.shownPopup) {
                if (this.focusAcquired) return;

                if (!this.shownPopup.isInBound(e.x, e.y, 0) && !overlay.getUnderlyingView().isInBound(e.x, e.y, 5)) {
                    this.shownPopup.close();
                    this.shownPopup = null;
                }
            }
        };
        // overlay.getEditor().getView().view.addEventListener("mousemove", this.onMouseMoveEvent, false);
        return this;
    }

    dispose(editor: Editor) {
        if (this.shownPopup) {
            this.shownPopup.dispose();
            // editor.getView().view.removeEventListener("mousemove", this.onMouseMoveEvent);
        }
    }
}
