import {Gutter} from "../gutter";
import {Editor} from "../../../Editor";
import {Component} from "../../components/Component";

export interface GutterComponent extends Component {
    editor: Editor;
    gutter: Gutter;

    element: HTMLElement;
}