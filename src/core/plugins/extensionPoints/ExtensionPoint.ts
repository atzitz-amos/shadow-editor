import {EditorPlugin} from "../loader/Plugin";

export class ExtensionPoint<T> {
    private static readonly registry = new Map<string, ExtensionPoint<any>[]>();
    private readonly contributions = new Map<EditorPlugin, T[]>();

    private contributeHandler: (p: EditorPlugin, i: T) => void;
    private withdrawHandler: (p: EditorPlugin) => void;

    constructor(public readonly name: string, private readonly ctor: Class<T>) {
        ExtensionPoint.define(name, this);
    }

    static forName(name: string): ExtensionPoint<any>[] {
        return ExtensionPoint.registry.get(name) ?? [];
    }

    private static define(name: string, extPoint: ExtensionPoint<any>): void {
        if (!this.registry.has(name)) {
            this.registry.set(name, [extPoint]);
        } else {
            this.registry.get(name)?.push(extPoint);
        }
    }

    onContribute(handler: (p: EditorPlugin, i: T) => void): ExtensionPoint<T> {
        this.contributeHandler = handler;
        return this;
    }

    onWithdraw(handler: (p: EditorPlugin) => void): ExtensionPoint<T> {
        this.withdrawHandler = handler;
        return this;
    }

    contribute(owner: EditorPlugin, instance: unknown): void {
        if (!this.accepts(instance))
            return;
        (this.contributions.get(owner) ?? this.contributions.set(owner, []).get(owner)!).push(instance);

        if (this.contributeHandler) this.contributeHandler(owner, instance);
    }

    withdraw(owner: EditorPlugin): void {
        this.contributions.delete(owner);

        if (this.withdrawHandler) this.withdrawHandler(owner);
    }

    getAll(): T[] {
        return [...this.contributions.values()].flat();
    }

    forAll(plugin: EditorPlugin, callback: (obj: T) => void) {
        this.contributions.get(plugin)?.forEach(callback);
    }

    definingPlugin(cls: T): EditorPlugin | undefined {
        for (const [plugin, inspections] of this.contributions.entries()) {
            for (const inspection of inspections) {
                if (inspection === cls) return plugin;
            }
        }
    }

    private accepts(instance: unknown): instance is T {
        return instance instanceof this.ctor;
    }
}

export class ExtensionPointUtils {
    public static removeByPlugin<T>(extPoint: ExtensionPoint<T>, plugin: EditorPlugin, cb: (t: T) => void) {
        extPoint.forAll(plugin, cb);
    }
}