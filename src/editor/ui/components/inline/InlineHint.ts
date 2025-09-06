import {TextRange} from "../../../core/coordinate/TextRange";
import {InlineComponent} from "../../../core/components/InlineComponent";

export class InlineHint extends InlineComponent {
    name: string = "inline-hint";

    className: string = "";
    msg: string;
    range: TextRange;

    constructor(pos: Offset, content: string) {
        super();

        this.msg = content;
        this.range = new TextRange(pos, pos + 1);
    }
}