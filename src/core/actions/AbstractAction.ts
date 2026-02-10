import {Keybind} from "../keybinds/Keybind";
import {Registry} from "../../editor/core/Registry";
import {KeybindContextDescriptor} from "../keybinds/context/KeybindContextDescriptor";
import {KeybindContext} from "../keybinds/context/KeybindContext";


export abstract class AbstractAction {
    id: string;
    name: string;
    description: string;

    defaultKeybinding?: Keybind;
    keybindContext: KeybindContextDescriptor = KeybindContextDescriptor.IN_MAIN_EDITOR;

    constructor() {
        this.id = Registry.getActionIdFor(this.name);
    }

    abstract run(ctx: KeybindContext): void;
}

