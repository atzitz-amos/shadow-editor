import {InlayComponent} from "../ui/components/inline/inlays/InlayComponent";
import {View} from "../ui/View";

export class InlayUtils {
    static getInlayWidth(view: View, inlay: InlayComponent): number {
        const span = inlay.getInsertedElement();
        span.style.position = "absolute";
        span.style.visibility = "hidden";

        view.layers.text.lines[0].appendChild(span);
        const width = span.getBoundingClientRect().width;
        view.layers.text.lines[0].removeChild(span);
        return width;
    }
}