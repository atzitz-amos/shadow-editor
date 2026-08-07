/*
 * Author: Atzitz Amos
 * Date: 10/6/2025
 */

import {TextAttributeKey} from "./style/TextAttributeKey";
import {TextRange} from "../../core/coordinate/range/TextRange";
import {Fragment} from "../../core/components/fragments/Fragment";
import {OverlayWidget} from "../inline/widget/overlay/OverlayWidget";
import {TrackedRange} from "../../core/coordinate/range/TrackedRange";
import {Document} from "../../core/document/Document";

export class HighlightHolder {
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
