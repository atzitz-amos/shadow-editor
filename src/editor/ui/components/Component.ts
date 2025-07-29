import {View} from "../View";

export interface Component {
    render(): HTMLElement;

    getWidth(view: View): number;
}