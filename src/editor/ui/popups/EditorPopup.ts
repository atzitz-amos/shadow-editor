import {IPopup} from "./IPopup";
import {Editor} from "../../Editor";
import {HTMLUtils} from "../../utils/HTMLUtils";
import {EditorKeysHelper} from "../../core/keycontext/EditorKeysHelper";
import {CloseOn} from "../../../core/ui/api/Closeable";
import {MeasurableUIComponent} from "../../../core/ui/engine/components/MeasurableUIComponent";

/**
 *
 * @author Atzitz Amos
 * @date 6/1/2026
 * @since 1.0.0
 */
export abstract class EditorPopup extends MeasurableUIComponent implements IPopup {
    protected isOpen = false;

    protected constructor(protected editor: Editor, className: string, private closeOn: CloseOn) {
        super(HTMLUtils.createDiv("editor-popup " + className));
    }

    close(): void {
        if (!this.isOpen) {
            throw new Error("Popup is not open");
        }
        this.dispose();
    }

    open(x: number, y: number): void {
        if (this.isOpen) {
            throw new Error("Popup is already open");
        }
        this.isOpen = true;
        this.editor.getView().getLayers().getPopupLayer().addChild(this);
        this.draw();

        this.getUnderlyingElement().style.left = HTMLUtils.px(x);
        this.getUnderlyingElement().style.top = HTMLUtils.px(y);

        EditorKeysHelper.closeOn(this, this.closeOn);
    }

    move(x: number, y: number) {
        if (!this.isOpen) {
            throw new Error("Popup is not open");
        }
        this.getUnderlyingElement().style.left = HTMLUtils.px(x);
        this.getUnderlyingElement().style.top = HTMLUtils.px(y);
    }

    getHeight(): number {
        if (!this.isOpen) {
            throw new Error("Popup is not open");
        }
        return this.getUnderlyingElement().offsetHeight;
    }

    getWidth(): number {
        if (!this.isOpen) {
            throw new Error("Popup is not open");
        }
        return this.getUnderlyingElement().offsetWidth;
    }

    measure(): DOMRect {
        if (this.isOpen) {
            return this.getUnderlyingElement().getBoundingClientRect();
        }
        return super.measure(this.editor.getView().getLayers().getPopupLayer());
    }

    isInBound(x: number, y: number, delta: number): boolean {
        if (!this.isOpen) {
            return false;
        }
        const rect = this.getUnderlyingElement().getBoundingClientRect();
        return x >= rect.left - delta && x <= rect.right + delta && y >= rect.top - delta && y <= rect.bottom + delta;
    }
}
