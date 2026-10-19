import {Fragment} from "../../core/components/fragments/Fragment";
import {TextRange} from "../../core/coordinate/range/TextRange";
import {OverlayWidget} from "../inline/widget/overlay/OverlayWidget";
import {HighlightHolder} from "./HighlightHolder";
import {TextAttributeKey} from "./style/TextAttributeKey";

/**
 *
 * @author Atzitz Amos
 * @date 10/4/2026
 * @since 1.0.0
 */
export class DocumentAgnosticHighlightHolder implements HighlightHolder {
    private fragments: Fragment[] = [];

    private overlays: OverlayWidget[] = [];

    constructor(private readonly priority: number) {
    }

    highlightRange(range: TextRange, attributes: TextAttributeKey, classNames?: string[]) {
        this.fragments.push(new Fragment(range, this.priority, attributes, classNames ?? []));
    }

    addOverlay(widget: OverlayWidget) {
        this.overlays.push(widget);
    }

    clear() {
        this.fragments = [];
        this.overlays = [];
    }

    toFragments(): Fragment[] {
        return this.fragments;
    }
}
