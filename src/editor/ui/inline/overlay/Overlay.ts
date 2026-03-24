import {Editor} from "../../../Editor";
import {TextRange} from "../../../core/coordinate/TextRange";
import {EditorCallbacksUtils} from "../../../utils/EditorCallbacksUtils";
import {HTMLView} from "../view/HTMLView";
import {OverlayEvent} from "./OverlayEvent";
import {Scheduler} from "../../../../core/scheduler/Scheduler";

/**
 * A wrapper around an HTMLSpanView that represents an overlay in the editor.
 * It provides methods to style the overlay and add event listeners for user interactions.
 *
 * @author Atzitz Amos
 * @date 10/24/2025
 * @since 1.0.0
 */
export class Overlay {
    private hoverTimeoutId: NodeJS.Timeout | null = null;
    private readonly editor: Editor;

    constructor(private view: HTMLView, private range: TextRange) {
        this.editor = view.getEditor();
    }

    public getEditor(): Editor {
        return this.editor;
    }

    public getUnderlyingView(): HTMLView {
        return this.view;
    }

    public getRange(): TextRange {
        return this.range;
    }

    public style(styles: Record<any, any>): void {
        const stylesheet = this.view.getCommonStylesheet();
        for (const key in styles) {
            if (styles.hasOwnProperty(key)) {
                stylesheet.setProperty(key, styles[key] as string);
            }
        }
    }

    public whenHovered(callback: (event: OverlayEvent) => void): void {
        this.view.addEventListener("mouseover", (e: MouseEvent) => {
            callback(new OverlayEvent(this.editor, e));
        });
    }

    public whenHoveredWithDelay(delayMs: number, callback: (event: OverlayEvent) => void, cancelOnType: boolean = true): void {
        if (this.hoverTimeoutId) {
            throw new Error("Hover listener with delay is already set up.");
        }
        this.view.addEventListener("mouseover", (e: MouseEvent) => {
            this.hoverTimeoutId = Scheduler.after(delayMs, () => {
                callback(new OverlayEvent(this.editor, e));
                this.hoverTimeoutId = null;
            });
        });

        this.view.addEventListener("mouseout", () => {
            if (this.hoverTimeoutId) {
                clearTimeout(this.hoverTimeoutId);
                this.hoverTimeoutId = null;
            }
        });

        if (cancelOnType) {
            EditorCallbacksUtils.cancelOnType(this.editor, this, () => {
                if (this.hoverTimeoutId) {
                    clearTimeout(this.hoverTimeoutId);
                    this.hoverTimeoutId = null;
                }
            });
        }
    }

    public whenUnhovered(callback: (event: OverlayEvent) => void): void {
        this.view.addEventListener("mouseout", (e: MouseEvent) => {
            callback(new OverlayEvent(this.editor, e));
        });
    }

    public whenClicked(callback: (event: OverlayEvent) => void): void {
        this.view.addEventListener("click", (e: MouseEvent) => {
            callback(new OverlayEvent(this.editor, e));
        });
    }

    public dispose(): void {
        EditorCallbacksUtils.removeAllCallbacks(this.editor, this);
    }
}
