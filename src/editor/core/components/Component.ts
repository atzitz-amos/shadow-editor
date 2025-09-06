import {Editor} from "../../Editor";

export interface Component {
    name: string;
    id: string;

    onDestroy(editor: Editor): void;
}