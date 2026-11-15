import {PopupBuilder} from "./PopupBuilder";
import {Editor} from "../../../Editor";
import {EditorInlinePopup} from "../EditorInlinePopup";
import {CloseOn} from "../../../../core/ui/api/Closeable";

/**
 * Common frame for popups anchored somewhere in the editor. Handles opening/closing, viewport-aware
 * positioning, and the default dismissal behavior: clicking outside the popup always closes it, and
 * (when {@link captureFocus} is enabled) so does pressing Escape.
 *
 * This frame has no notion of hover - a popup that should show/hide based on hovering some element
 * wires that up itself, on top of this default behavior, via {@link onPopupOpened}/{@link onPopupClosed},
 * rather than the frame knowing about it.
 *
 * Subclasses are responsible for:
 *  - telling the frame which {@link Editor} the popup layer belongs to ({@link getEditor})
 *  - computing where the popup should be anchored ({@link computeAnchor})
 *
 * @author Atzitz Amos
 * @date 6/1/2026
 * @since 1.0.0
 */
export abstract class EditorInlinePopupFrame {
    protected showDelay = 0;
    protected disposed = false;

    private showTimer: ReturnType<typeof setTimeout> | null = null;
    private popup: EditorInlinePopup | null = null;
    private shouldCaptureFocus = false;
    private closeOnFlags: CloseOn = CloseOn.ESCAPE;

    protected constructor(protected readonly builder: PopupBuilder) {
    }

    public getPopup(): EditorInlinePopup | null {
        return this.popup;
    }

    public delayed(delayMs: number): this {
        if (delayMs < 0) {
            throw new Error("Popup delay cannot be negative");
        }
        this.showDelay = delayMs;
        return this;
    }

    /**
     * When enabled, opening the popup forces focus onto it and installs a keydown listener
     * (see {@link onKeyDown}) that by default closes the popup on Escape.
     */
    public captureFocus(capture: boolean = true): this {
        this.shouldCaptureFocus = capture;
        return this;
    }

    /**
     * The {@link CloseOn} flags the popup is opened with. Defaults to {@link CloseOn.ESCAPE}.
     */
    public closeOn(flags: CloseOn): this {
        this.closeOnFlags = flags;
        return this;
    }

    public dispose(): void {
        this.disposed = true;
        this.hide();
    }

    /**
     * Moves the open popup back onto its anchor, e.g. after its content, and so its size, changed or after
     * the editor scrolled. Does nothing while the popup is closed.
     */
    public reposition(): void {
        if (this.popup === null || this.popup.isDisposed()) return;

        const {x, y} = this.computePosition(this.popup);
        this.popup.move(x, y);
    }

    protected abstract getEditor(): Editor;

    /**
     * Computes the rectangle the popup should be anchored to, in the popup layer's own local
     * coordinate space (i.e. (0, 0) is the layer's top-left corner - the same space `popup.open`
     * positions into). `x` is the horizontal position to open at; `top`/`bottom` delimit the
     * anchor so the popup can be flipped above it when there isn't enough room below.
     *
     * `layerBounds` is the popup layer's bounding box in client (viewport) coordinates, given in
     * case the subclass's own source of truth (a mouse event, an element's
     * `getBoundingClientRect()`, ...) is client-relative and needs converting into local
     * coordinates by subtracting `layerBounds.left`/`layerBounds.top`. A subclass whose source of
     * truth is already local to this frame (e.g. `Editor.offsetToXY`) can ignore it.
     */
    protected abstract computeAnchor(layerBounds: DOMRect): { x: number; top: number; bottom: number };

    /**
     * Hook for subclasses that need extra behavior once the popup element exists - e.g. a
     * hover-triggered popup wiring up its own mouseover/mouseout listeners. No-op by default.
     */
    protected onPopupOpened(popupElement: HTMLElement): void {
    }

    /** Hook for subclasses to clean up whatever {@link onPopupOpened} set up. No-op by default. */
    protected onPopupClosed(): void {
    }

    protected scheduleShow(): void {
        this.cancelShow();
        this.showTimer = setTimeout(() => {
            this.showTimer = null;
            if (!this.disposed) {
                this.show();
            }
        }, this.showDelay);
    }

    protected show(): void {
        if (this.popup !== null && !this.popup.isDisposed()) {
            return;
        }

        const popup = this.builder.build(this.getEditor());
        const {x, y} = this.computePosition(popup);

        popup.open(x, y, this.closeOnFlags);
        this.popup = popup;
        // The popup can be closed behind our back by one of its CloseOn flags
        popup.setOnDisposed(() => {
            if (this.popup === popup) this.hide();
        });

        const popupElement = popup.getUnderlyingElement();
        popupElement.tabIndex = -1;
        popupElement.addEventListener("mousedown", this.onPopupMouseDown);
        document.addEventListener("mousedown", this.onOutsideMouseDown, true);

        if (this.shouldCaptureFocus) {
            document.addEventListener("keydown", this.onPopupKeyDown, true);
            popupElement.focus();
        }

        this.onPopupOpened(popupElement);
    }

    /**
     * Only wired up when {@link captureFocus} is enabled. Override to react to other keys;
     * call `super.onKeyDown(event)` to keep the default Escape-to-close behavior.
     */
    protected onKeyDown(event: KeyboardEvent): void {
        if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            this.hide();
        }
    }

    protected hide(): void {
        this.cancelShow();
        const popup = this.popup;
        if (popup === null) {
            return;
        }
        // Cleared first: disposing the popup and the onPopupClosed hook can both lead back here
        this.popup = null;

        document.removeEventListener("mousedown", this.onOutsideMouseDown, true);
        if (this.shouldCaptureFocus) {
            document.removeEventListener("keydown", this.onPopupKeyDown, true);
        }

        // Only take the focus back if the popup had it: a popup that never captured it may be closing precisely
        // because the focus went somewhere else, and must not steal it back.
        const hadFocus = this.shouldCaptureFocus || popup.getUnderlyingElement().contains(document.activeElement);

        popup.setOnDisposed(null);
        popup.dispose();

        if (hadFocus) this.getEditor().getView().focus();

        this.onPopupClosed();
    }

    protected cancelShow(): void {
        if (this.showTimer !== null) {
            clearTimeout(this.showTimer);
            this.showTimer = null;
        }
    }

    protected isWithinPopup(target: EventTarget | null): boolean {
        return target instanceof Node && this.popup !== null &&
            this.popup.getUnderlyingElement().contains(target);
    }

    /**
     * Where `popup` should be, in the popup layer's own local coordinate space: below its anchor, flipped above
     * it when there isn't enough room, and always inside the layer.
     */
    private computePosition(popup: EditorInlinePopup): { x: number; y: number } {
        const popupLayer = this.getEditor().getView().getLayers().getPopupLayer();
        const layerBounds = popupLayer.getBBox();
        const popupBounds = popup.measure();
        const anchor = this.computeAnchor(layerBounds);

        // Everything from here on is in the popup layer's own local coordinate space: (0, 0) is
        // the layer's top-left corner, and popupWidth/popupHeight are its usable extent.
        const popupWidth = layerBounds.right - layerBounds.left;
        const popupHeight = layerBounds.bottom - layerBounds.top;

        let x = anchor.x;
        let y = anchor.bottom + 2;

        const fitsBelow = y + popupBounds.height <= popupHeight;
        if (!fitsBelow) {
            const above = anchor.top - popupBounds.height - 2;
            const fitsAbove = above >= 0;
            if (fitsAbove) {
                y = above;
            } else {
                // Neither side fully fits (e.g. an anchor right at the top of the layer) - clamp
                // inside the layer instead of flipping off-screen.
                y = Math.max(0, Math.min(y, popupHeight - popupBounds.height));
            }
        }

        if (x + popupBounds.width > popupWidth) {
            x = popupWidth - popupBounds.width;
        }
        x = Math.max(x, 0);

        return {x, y};
    }

    private readonly onPopupMouseDown = (event: MouseEvent): void => {
        // Keep clicks inside the popup from bubbling up to editor-level handlers.
        event.stopPropagation();
        // A popup that closes when the editor loses the focus must not take it by being clicked.
        if (this.closeOnFlags & CloseOn.BLUR) event.preventDefault();
    };

    private readonly onOutsideMouseDown = (event: MouseEvent): void => {
        if (!this.isWithinPopup(event.target)) {
            this.hide();
        }
    };

    private readonly onPopupKeyDown = (event: KeyboardEvent): void => {
        this.onKeyDown(event);
    };
}