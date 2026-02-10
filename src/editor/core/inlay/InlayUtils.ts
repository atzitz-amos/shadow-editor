import {View} from "../../ui/view/View";
import {InlayWidget} from "../../ui/inline/inlay/InlayWidget";
import {Editor} from "../../Editor";
import {InlayRecord} from "./InlayManager";

export class InlayUtils {
    static getInlayWidth(view: View, inlay: InlayWidget): number {
        const span = inlay.getInsertedComponent();
        span.style.position = "absolute";
        span.style.visibility = "hidden";

        view.getLayers().getTextLayer().lines[0].appendChild(span);
        const width = span.getBoundingClientRect().width;
        view.getLayers().getTextLayer().lines[0].removeChild(span);
        return width;
    }

    static toInlayRecord(inlay: InlayWidget, editor: Editor): InlayRecord {
        return {
            offset: inlay.getOffset(),
            deltaOffset: inlay.getLogicalDelta(),
            width: InlayUtils.getInlayWidth(editor.view, inlay)
        };
    }
}