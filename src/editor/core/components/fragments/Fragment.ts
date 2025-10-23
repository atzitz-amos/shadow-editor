import {TextAttributes} from "../../../ui/highlighter/style/TextAttributes";
import {TextRange} from "../../coordinate/TextRange";

/**
 * Represents a fragment (start / end) of a highlighted range
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

    getComponentStyle(): TextAttributes {
        return this.attributes;
    }

    getClassList(): string[] {
        return this.classList;
    }

    getElements(): HTMLSpanElement[] {
        return this.elements;
    }

    addElement(span: HTMLSpanElement): void {
        this.elements.push(span);
    }
}