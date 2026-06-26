import {OverlayEvent} from "./OverlayEvent";
import {TextRange} from "../../../../core/coordinate/range/TextRange";
import {HTMLView} from "../../view/HTMLView";
import {Editor} from "../../../../Editor";
import {TextAttributeKey} from "../../../highlighter/style/TextAttributeKey";

/**
 * A wrapper around an HTMLSpanView that represents an overlay in the editor.
 * It provides methods to style the overlay and add event listeners for user interactions.
 *
 * @author Atzitz Amos
 * @date 10/24/2025
 * @since 1.0.0
 */
export class Overlay {
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

    public style(attributes: TextAttributeKey): void;
    public style(styles: Record<any, any>): void;
    public style(styles: Record<any, any> | TextAttributeKey): void {
        if (styles instanceof TextAttributeKey) {
            this.view.applyTextAttributes(styles);
            return;
        }
        const stylesheet = this.view.getCommonStylesheet();
        for (const key in styles) {
            if (styles.hasOwnProperty(key)) {
                stylesheet.setProperty(key, styles[key] as string);
            }
        }
    }

    public whenMouseOver(callback: (event: OverlayEvent) => void): void {
        this.view.addEventListener("mouseover", (e: MouseEvent) => {
            callback(new OverlayEvent(this.editor, e));
        });
    }

    public whenMouseOut(callback: (event: OverlayEvent) => void): void {
        this.view.addEventListener("mouseout", (e: MouseEvent) => {
            callback(new OverlayEvent(this.editor, e));
        });
    }

    public whenMouseDown(callback: (event: OverlayEvent) => void): void {
        this.view.addEventListener("mousedown", (e: MouseEvent) => {
            callback(new OverlayEvent(this.editor, e));
        });
    }

    public cleanupEvents(): void {
    }
}
