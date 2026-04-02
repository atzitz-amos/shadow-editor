import {Editor} from "../../Editor";

export interface Component {
    name: string;

    onDestroy(editor: Editor): void;
}