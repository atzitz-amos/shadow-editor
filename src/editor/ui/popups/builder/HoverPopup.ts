import {PopupBuilder} from "./PopupBuilder";
import {Overlay} from "../../inline/widget/overlay/Overlay";
import {EditorInlinePopup} from "../EditorInlinePopup";
import {CloseOn} from "../../../../core/ui/api/Closeable";

/**
 *
 * @author Atzitz Amos
 * @date 6/1/2026
 * @since 1.0.0
 */
export class HoverPopup {
    private showDelay = 0;
    private showTimer: ReturnType<typeof setTimeout> | null = null;
    private popup: EditorInlinePopup | null = null;
    private overlay: Overlay | null = null;
    private disposed = false;
    private locked = false;

    public constructor(private readonly builder: PopupBuilder) {
    }

    public delayed(delayMs: number): HoverPopup {
        if (delayMs < 0) {
            throw new Error("Hover popup delay cannot be negative");
        }
        this.showDelay = delayMs;
        return this;
    }

    public attachToOverlay(overlay: Overlay): HoverPopup {
        if (this.overlay !== null) {
            throw new Error("Hover popup is already attached to an overlay");
        }
        this.overlay = overlay;

        overlay.whenMouseOver(event => {
            if (this.disposed || this.isWithinOverlay(event.getEvent().relatedTarget)) {
                return;
            }
            this.scheduleShow(event.getEvent());
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

    public dispose(): void {
        this.disposed = true;
        this.hide();
    }

    private scheduleShow(event: MouseEvent): void {
        this.cancelShow();
        this.showTimer = setTimeout(() => {
            this.showTimer = null;
            if (!this.disposed && this.overlay !== null) {
                this.show(event);
            }
        }, this.showDelay);
    }

    private show(event: MouseEvent): void {
        if (this.popup !== null && !this.popup.isDisposed()) {
            return;
        }

        const overlay = this.overlay!;
        const popupLayer = overlay.getEditor().getView().getLayers().getPopupLayer();
        const viewport = popupLayer.getBBox();
        const overlayElement = overlay.getUnderlyingView().getElementsAt(event.x, event.y)[0];
        const overlayBounds = overlayElement?.getBoundingClientRect() ?? overlay.getUnderlyingView().getBBox();
        const popup = this.builder.build(overlay.getEditor());
        const popupBounds = popup.measure();

        let x = event.x;
        let y = overlayBounds.bottom + 2;
        if (y + popupBounds.height > viewport.bottom) {
            y = overlayBounds.top - popupBounds.height - 2;
        }
        if (x + popupBounds.width > viewport.right) {
            x = viewport.right - popupBounds.width;
        }
        x = Math.max(x, viewport.left);

        popup.open(x - viewport.left, y - viewport.top, CloseOn.ESCAPE);
        this.popup = popup;
        document.addEventListener("keydown", this.onPopupKeyDown, true);

        const popupElement = popup.getUnderlyingElement();
        popupElement.tabIndex = -1;
        popupElement.addEventListener("mouseover", this.onPopupMouseOver);
        popupElement.addEventListener("mouseout", this.onPopupMouseOut);
        popupElement.addEventListener("mousedown", this.onPopupMouseDown);
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

    private readonly onPopupMouseDown = (event: MouseEvent): void => {
        event.stopPropagation();
        this.locked = true;
        this.popup?.getUnderlyingElement().focus();
        document.addEventListener("mousedown", this.onLockedMouseDown, true);
    };

    private readonly onLockedMouseDown = (event: MouseEvent): void => {
        if (!this.isWithinPopup(event.target)) {
            this.hide();
        }
    };

    private readonly onPopupKeyDown = (event: KeyboardEvent): void => {
        if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            this.hide();
        }
    };

    private hide(): void {
        this.cancelShow();
        document.removeEventListener("keydown", this.onPopupKeyDown, true);
        if (this.locked) {
            document.removeEventListener("mousedown", this.onLockedMouseDown, true);
            this.locked = false;
        }
        if (this.popup !== null) {
            this.popup.dispose();
            this.popup = null;
        }
    }

    private cancelShow(): void {
        if (this.showTimer !== null) {
            clearTimeout(this.showTimer);
            this.showTimer = null;
        }
    }

    private isWithinOverlay(target: EventTarget | null): boolean {
        return target instanceof Node && this.overlay !== null &&
            this.overlay.getUnderlyingView().getAssociatedElements().some(element => element.contains(target));
    }

    private isWithinPopup(target: EventTarget | null): boolean {
        return target instanceof Node && this.popup !== null &&
            this.popup.getUnderlyingElement().contains(target);
    }
}
