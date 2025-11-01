import {TextRange} from "../../coordinate/TextRange";
import {FragmentEvent, FragmentType} from "./FragmentEvent";
import {TextAttributes} from "../../../ui/highlighter/style/TextAttributes";

/**
 * Represents a fragment (start / end) of a widget or highlight
 *
 * @author Atzitz Amos
 * @date 10/23/2025
 * @since 1.0.0
 */
export class Fragment {
    private readonly elements: HTMLSpanElement[] = [];

    constructor(private range: TextRange, private attributes: TextAttributes, private classList: string[]) {
    }

    getRange(): TextRange {
        return this.range;
    }

    getClassList(): string[] {
        return this.classList;
    }

    getElements(): HTMLSpanElement[] {
        return this.elements;
    }

    getFragmentStyle(): TextAttributes {
        return this.attributes;
    }

    addElement(span: HTMLSpanElement): void {
        this.elements.push(span);
    }

    toEvents(min: Offset, max: Offset): FragmentEvent[] {
        if (this.getRange().end < min || this.getRange().start > max) {
            return [];
        }
        let start = Math.max(this.getRange().start, min);
        let end = Math.min(this.getRange().end, max);
        return [
            new FragmentEvent(FragmentType.START_RANGE, this, start),
            new FragmentEvent(FragmentType.END_RANGE, this, end)
        ];
    }
}