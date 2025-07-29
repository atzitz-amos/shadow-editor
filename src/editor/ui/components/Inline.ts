import {Component} from "./Component";
import {TextRange} from "../../core/Position";

export interface InlineComponent extends Component {
    className: string;
    content: string;

    range: TextRange;
}