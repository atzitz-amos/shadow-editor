import {Component} from "../../../core/components/Component";

export interface GutterComponent extends Component {
    line: number;

    element: HTMLSpanElement;

    render(): HTMLSpanElement;
}