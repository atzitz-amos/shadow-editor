import {Gutter} from "../Gutter";
import {Editor} from "../../../Editor";
import {Component} from "../../components/Component";

export interface GutterComponent extends Component {
    editor: Editor;
    gutter: Gutter;

    element: HTMLElement;
}