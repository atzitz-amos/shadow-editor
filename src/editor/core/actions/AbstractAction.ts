import {Keybind} from "../events/Keybind";
import {Registry} from "../Registry";
import {Editor} from "../../Editor";


export abstract class AbstractAction {
    id: string;
    name: string;
    description: string;

    defaultKeybinding?: Keybind;

    constructor() {
        this.id = Registry.getActionIdFor(this.name);
    }

    abstract run(editor: Editor, event: KeyboardEvent | MouseEvent): void;
}

