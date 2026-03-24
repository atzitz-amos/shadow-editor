import {Editor} from "../../../Editor";
import {TextRange} from "../../../core/coordinate/TextRange";
import {EditorCallbacksUtils} from "../../../utils/EditorCallbacksUtils";
import {InlayEvent} from "./InlayEvent";
import {Scheduler} from "../../../../core/scheduler/Scheduler";

/**
 * A wrapper around an HTMLSpan that represents an inlay in the editor.
 * It provides methods to style the inlay and add event listeners for user interactions.
 *
 * @author Atzitz Amos
 * @date 10/24/2025
 * @since 1.0.0
 */
export class Inlay {
    private hoverTimeoutId: NodeJS.Timeout | null = null;

    constructor(private span: HTMLSpanElement, private editor: Editor, private range: TextRange) {
    }

    public getEditor(): Editor {
        return this.editor;
    }

    public getUnderlyingElement(): HTMLSpanElement {
        return this.span;
    }

    public getRange(): TextRange {
        return this.range;
    }

    public style(styles: Partial<CSSStyleDeclaration>): void {
        for (const key in styles) {
            if (styles.hasOwnProperty(key)) {
                this.span.style.setProperty(key, styles[key as keyof CSSStyleDeclaration] as string);
            }
        }
    }

    public whenHovered(callback: (event: InlayEvent) => void): void {
        this.span.addEventListener("mouseover", (e: MouseEvent) => {
            callback(new InlayEvent(this.editor, e));
        }, true);
    }

    public whenHoveredWithDelay(delayMs: number, callback: (event: InlayEvent) => void, cancelOnType: boolean = true): void {
        if (this.hoverTimeoutId) {
            throw new Error("Hover listener with delay is already set up.");
        }
        this.span.addEventListener("mouseover", (e: MouseEvent) => {
            this.hoverTimeoutId = Scheduler.after(delayMs, () => {
                callback(new InlayEvent(this.editor, e));
                this.hoverTimeoutId = null;
            });
        }, true);

        this.span.addEventListener("mouseout", () => {
            if (this.hoverTimeoutId) {
                clearTimeout(this.hoverTimeoutId);
                this.hoverTimeoutId = null;
            }
        }, true);

        if (cancelOnType) {
            EditorCallbacksUtils.cancelOnType(this.editor, this, () => {
                if (this.hoverTimeoutId) {
                    clearTimeout(this.hoverTimeoutId);
                    this.hoverTimeoutId = null;
                }
            });
        }
    }

    public whenUnhovered(callback: (event: InlayEvent) => void): void {
        this.span.addEventListener("mouseout", (e: MouseEvent) => {
            callback(new InlayEvent(this.editor, e));
        });
    }

    public whenClicked(callback: (event: InlayEvent) => void): void {
        this.span.addEventListener("click", (e: MouseEvent) => {
            callback(new InlayEvent(this.editor, e));
        });
    }

    public dispose(): void {
        EditorCallbacksUtils.removeAllCallbacks(this.editor, this);
    }
}
