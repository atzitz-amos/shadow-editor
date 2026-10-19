/*
 * Author: Atzitz Amos
 * Date: 10/6/2025
 */

import {TextRange} from "../../core/coordinate/range/TextRange";
import {TextAttributeKey} from "./style/TextAttributeKey";
import {OverlayWidget} from "../inline/widget/overlay/OverlayWidget";
import {Fragment} from "../../core/components/fragments/Fragment";

export interface HighlightHolder {
    highlightRange(range: TextRange, attributes: TextAttributeKey, classNames?: string[]): void;

    addOverlay(widget: OverlayWidget): void;

    clear(): void;

    toFragments(): Fragment[]

}
