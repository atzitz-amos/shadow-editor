import {Keybind} from "../keybinds/Keybind";
import {Registry} from "../../editor/core/Registry";
import {KeybindContextDescriptor} from "../keybinds/context/KeybindContextDescriptor";
import {KeybindContext} from "../keybinds/context/KeybindContext";


export abstract class AbstractAction {
    private static readonly registry: Map<Class<AbstractAction>, AbstractAction> = new Map<Class<AbstractAction>, AbstractAction>();
    id: string;

    constructor() {
        this.id = Registry.getActionIdFor(this.getName());

        AbstractAction.registry.set(this.constructor as Class<AbstractAction>, this);
    }

    public static get class() {
        return this.registry.get(this)!;
    }

    getId(): string {
        return this.id;
    }

    abstract run(ctx: KeybindContext): void | Promise<void>;

    abstract getName(): string;

    abstract getDescription(): string;

    abstract getDefaultKeybinding(): Keybind | null;

    getKeybindContext(): KeybindContextDescriptor {
        return KeybindContextDescriptor.IN_MAIN_EDITOR;
    }
}

