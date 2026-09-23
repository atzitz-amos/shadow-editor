import {Keybind} from "../keybinds/Keybind";
import {Registry} from "../../editor/core/Registry";
import {KeybindContextDescriptor} from "../keybinds/context/KeybindContextDescriptor";
import {KeybindContext} from "../keybinds/context/KeybindContext";
import {DataKey} from "../keybinds/context/data/DataKey";
import {CommonDataKeys} from "../keybinds/context/data/CommonDataKeys";


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

    public static getID(): string {
        return this.registry.get(this as unknown as Class<AbstractAction>)!.getId();
    }

    /**
     * Run the action in the provided context.
     * Can be async.
     *
     * @param ctx the context in which the action is ran
     * */
    abstract run(ctx: KeybindContext): void | Promise<void>;

    /**
     * @returns the name of the action to be displayed*/
    abstract getName(): string;

    /**
     * @returns the description of the action*/
    abstract getDescription(): string;

    /**
     * @returns the default keybinding of the action*/
    abstract getDefaultKeybinding(): Keybind | null;

    /**
     * @returns the automatically generated id of the action.
     */
    getId(): string {
        return this.id;
    }

    /**
     *  Calls when the action if first added by the PluginLoader. Use it to add the action to any group.
     */
    addToGroups() {

    }

    /**
     * @returns the context in which this action can be ran.
     */
    getKeybindContext(): KeybindContextDescriptor {
        return KeybindContextDescriptor.IN_MAIN_EDITOR;
    }

    /**
     * Declares data that must be available before this action is offered.
     */
    getRequiredKeys(): DataKey<unknown>[] {
        const descriptor = this.getKeybindContext();
        const keys: DataKey<unknown>[] = [];
        if (descriptor & KeybindContextDescriptor.IN_MAIN_EDITOR) keys.push(CommonDataKeys.EDITOR);
        if (descriptor & KeybindContextDescriptor.IN_PANE) keys.push(CommonDataKeys.PANE);
        return keys;
    }

    isApplicable(ctx: KeybindContext): boolean {
        return this.getRequiredKeys().every(key => ctx.has(key));
    }
}
