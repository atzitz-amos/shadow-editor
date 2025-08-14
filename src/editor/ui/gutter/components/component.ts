import {Component} from "../../components/Component";

export interface GutterComponent extends Component {
    line: number;

    element: HTMLSpanElement;

    render(): HTMLSpanElement;
}