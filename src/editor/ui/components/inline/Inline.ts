import {Component} from "../Component";
import {TextRange} from "../../../core/Position";
import {Editor} from "../../../Editor";

export interface InlineComponent extends Component {
    className: string;
    content: string;

    range: TextRange;

    element?: HTMLElement | null;

    onRender(editor: Editor, element: HTMLSpanElement): void;
}