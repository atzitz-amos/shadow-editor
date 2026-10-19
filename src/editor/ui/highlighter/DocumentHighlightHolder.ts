import {Fragment} from "../../core/components/fragments/Fragment";
import {OverlayWidget} from "../inline/widget/overlay/OverlayWidget";
import {TextRange} from "../../core/coordinate/range/TextRange";
import {TrackedRange} from "../../core/coordinate/range/TrackedRange";
import {TextAttributeKey} from "./style/TextAttributeKey";
import {HighlightHolder} from "./HighlightHolder";
import {Document} from "../../core/document/Document";

/**
 *
 * @author Atzitz Amos
 * @date 10/4/2026
 * @since 1.0.0
 */
export class DocumentHighlightHolder implements HighlightHolder {
    private fragments: Fragment[] = [];

    private overlays: OverlayWidget[] = [];

    constructor(private document: Document, private readonly priority: number, private readonly trackRanges: boolean = false) {
    }

    highlightRange(range: TextRange, attributes: TextAttributeKey, classNames?: string[]) {
        if (this.trackRanges) {
            range = TrackedRange.of(range);
            this.document.addTrackedRange(range as TrackedRange);
        }
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
