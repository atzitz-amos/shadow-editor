/*
 * Author: Atzitz Amos
 * Date: 10/6/2025
 */

import {TextAttributes} from "./style/TextAttributes";
import {TextRange} from "../../core/coordinate/TextRange";
import {Editor} from "../../Editor";
import {Fragment} from "../../core/components/fragments/Fragment";
import {FragmentEvent} from "../../core/components/fragments/FragmentEvent";

export class HighlightHolder {
    private fragments: Fragment[] = [];

    constructor(private editor: Editor) {
    }

    highlightRange(range: TextRange, attributes: TextAttributes, classNames?: string[]) {
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
