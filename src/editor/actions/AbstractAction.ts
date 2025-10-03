import {Keybind} from "../core/events/keybind";
import {Registry} from "../core/Registry";
import {Editor} from "../Editor";


export abstract class AbstractAction {
    id: string;
    name: string;
    description: string;

    keybinding?: Keybind;

    constructor() {
        this.id = Registry.getActionIdFor(this.name);
    }

    abstract run(editor: Editor, event: KeyboardEvent): void;
}

