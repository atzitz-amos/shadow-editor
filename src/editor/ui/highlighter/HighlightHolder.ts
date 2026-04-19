/*
 * Author: Atzitz Amos
 * Date: 10/6/2025
 */

import {TextAttributeKey} from "./style/TextAttributeKey";
import {TextRange} from "../../core/coordinate/TextRange";
import {Editor} from "../../Editor";
import {Fragment} from "../../core/components/fragments/Fragment";

export class HighlightHolder {
    private fragments: Fragment[] = [];

    constructor(private editor: Editor) {
    }

    highlightRange(range: TextRange, attributes: TextAttributeKey, classNames?: string[]) {
        this.fragments.push(new Fragment(range, attributes, classNames ?? []));
    }

    clear() {
        this.fragments = [];
    }

    clearRange(range: TextRange) {
        const next: Fragment[] = [];

        for (const fragment of this.fragments) {
            const fragmentRange = fragment.getRange();

            if (!fragmentRange.intersects(range)) {
                next.push(fragment);
                continue;
            }

            // Keep only the left remainder when the clear range starts inside this fragment.
            const leftStart = fragmentRange.start;
            const leftEnd = Math.min(fragmentRange.end, range.start);
            if (leftStart < leftEnd) {
                next.push(new Fragment(
                    new TextRange(leftStart, leftEnd),
                    fragment.getFragmentStyle(),
                    [...fragment.getClassList()]
                ));
            }

            // Keep only the right remainder when the clear range ends inside this fragment.
            const rightStart = Math.max(fragmentRange.start, range.end);
            const rightEnd = fragmentRange.end;
            if (rightStart < rightEnd) {
                next.push(new Fragment(
                    new TextRange(rightStart, rightEnd),
                    fragment.getFragmentStyle(),
                    [...fragment.getClassList()]
                ));
            }
        }

        this.fragments = next;
    }

    toFragments(): Fragment[] {
        return this.fragments;
    }
}
