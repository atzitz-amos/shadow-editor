import {Editor} from "../../Editor";

export interface Component {
    id: string;

    onDestroy(editor: Editor): void;
}