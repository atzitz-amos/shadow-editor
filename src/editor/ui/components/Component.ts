import {View} from "../View";

export interface Component extends Renderable {
    render(): HTMLElement;

    getWidth(view: View): number;
}