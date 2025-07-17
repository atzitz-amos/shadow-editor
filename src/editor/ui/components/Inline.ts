import {Component} from "./Component";

export interface InlineComponent extends Component {
    render(): HTMLSpanElement;

    getRange(): [Offset, Offset];
}