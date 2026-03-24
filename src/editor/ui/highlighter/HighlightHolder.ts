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
        this.fragments = this.fragments.filter(f => !f.getRange().intersects(range));
    }

    toFragments(): Fragment[] {
        return this.fragments;
    }
}
