import {InlineComponent} from "../../../../core/components/InlineComponent";
import {InlayRecord} from "../../../../core/inlay/InlayManager";
import {InlayUtils} from "../../../../utils/InlayUtils";
import {View} from "../../../View";


export abstract class InlayComponent extends InlineComponent {
    abstract getInsertedElement(): HTMLSpanElement;

    toInlayRecord(view: View): InlayRecord {
        return {
            offset: this.range.begin,
            deltaOffset: 1,
            width: InlayUtils.getInlayWidth(view, this)
        }
    }
}