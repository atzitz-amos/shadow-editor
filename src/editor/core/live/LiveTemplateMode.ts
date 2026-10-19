import {EditorModeEx} from "../behaviors/mode/EditorModeEx";
import {TextRange} from "../coordinate/range/TextRange";
import {EditorBehavior} from "../behaviors/EditorBehavior";
import {CharTypedBehavior} from "../behaviors/behavior/CharTypedBehavior";
import {BehaviorHandlingMode} from "../behaviors/manager/BehaviorHandlingMode";
import {Editor} from "../../Editor";
import {LiveTemplateOverlay} from "../../ui/inline/live/LiveTemplateOverlay";
import {TrackedRange} from "../coordinate/range/TrackedRange";
import {DeleteBackwardBehavior} from "../behaviors/behavior/DeleteBackwardBehavior";
import {EnterPressedBehavior} from "../behaviors/behavior/EnterPressedBehavior";
import {Document} from "../document/Document";

/**
 *
 * @author Atzitz Amos
 * @date 9/28/2026
 * @since 1.0.0
 */
export class LiveTemplateMode extends EditorModeEx {
    private range: TextRange;

    private wasSuccessful: boolean = false;

    private templateModifiedCallback: ((doc: Document, range: TextRange) => void) | null = null;
    private templateAcceptedCallback: ((range: TextRange) => void) | null = null;
    private templateRejectedCallback: (() => void) | null = null;

    constructor(range: TextRange) {
        super();
        this.range = range;
    }

    setTemplateModifiedCallback(callback: (doc: Document, range: TextRange) => void) {
        this.templateModifiedCallback = callback;
    }

    setTemplateAcceptedCallback(callback: (range: TextRange) => void) {
        this.templateAcceptedCallback = callback;
    }

    setTemplateRejectedCallback(callback: () => void) {
        this.templateRejectedCallback = callback;
    }

    getDisplayName(): string {
        return "Live Template"
    }

    onEnter(editor: Editor) {
        this.wasSuccessful = false;

        const overlay = new LiveTemplateOverlay(this.range);
        this.range = overlay.getRange();
        editor.getWidgetManager().addOverlayWidget(overlay);
        editor.repaintView();
    }

    onExit(editor: Editor) {
        if (this.range instanceof TrackedRange) {
            this.range.invalidate();
        }
        editor.getView().triggerOverlaysRepaint();

        if (this.wasSuccessful) this.templateAcceptedCallback?.(this.range);
        else this.templateRejectedCallback?.();
    }

    getCharTypedBehavior(): EditorBehavior {
        return CharTypedBehavior.wrapping(this, ctx => {
            const offset = ctx.getCaretOffset();
            if (offset < this.range.getStart() || offset > this.range.getEnd()) {
                this.wasSuccessful = true;
                ctx.getEditor().getBehaviorManager().exitMode();
            } else
                setTimeout(() => this.templateModifiedCallback?.(ctx.getEditor().getOpenedDocument(), this.range), 0);

            return BehaviorHandlingMode.FORWARD;
        });
    }

    getDeleteBackwardBehavior(): EditorBehavior {
        return DeleteBackwardBehavior.wrapping(this, ctx => {
            const offset = ctx.getCaretOffset();

            if (ctx.hasSelectionActive() && !(this.range.contains(ctx.getSelection().getRange()!))) {
                this.wasSuccessful = true;
                ctx.getEditor().getBehaviorManager().exitMode();
            }

            if (offset < this.range.getStart() || offset > this.range.getEnd()) {
                ctx.getEditor().getBehaviorManager().exitMode();
            } else
                setTimeout(() => this.templateModifiedCallback?.(ctx.getEditor().getOpenedDocument(), this.range), 0);

            return BehaviorHandlingMode.FORWARD;
        });
    }

    getEnterPressedBehavior(): EditorBehavior {
        return EnterPressedBehavior.wrapping(this, ctx => {
            this.wasSuccessful = true;
            ctx.getEditor().getBehaviorManager().exitMode();
            return this.range.contains(ctx.getCaretOffset()) ? BehaviorHandlingMode.HANDLED : BehaviorHandlingMode.FORWARD;
        });
    }
}
