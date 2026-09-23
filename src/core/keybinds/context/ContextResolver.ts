import {Editor} from "../../../editor/Editor";
import {IPane} from "../../../app/core/panes/pane/IPane";
import {KeybindContext} from "./KeybindContext";
import {KeybindContextDescriptor} from "./KeybindContextDescriptor";
import {KeybindEventLike} from "./KeybindEventLike";
import {CommonDataKeys} from "./data/CommonDataKeys";
import {DataContext, DataResolver} from "./data/DataContext";
import {DataKey} from "./data/DataKey";

export type ContextProviderValue = unknown | (() => unknown);

export interface ContextProvider {
    provide(key: DataKey<unknown>): ContextProviderValue | undefined;
}

/**
 * Resolves contextual data from registered UI elements.
 *
 * Providers are held weakly so detached UI components do not stay alive.
 */
export class ContextResolver {
    private static readonly providers = new WeakMap<HTMLElement, ContextProvider>();
    private static readonly globalProviders: ContextProvider[] = [];

    public static register(element: HTMLElement, provider: ContextProvider): () => void {
        this.providers.set(element, provider);
        return () => {
            if (this.providers.get(element) === provider) this.providers.delete(element);
        };
    }

    public static registerGlobal(provider: ContextProvider): () => void {
        this.globalProviders.push(provider);
        return () => {
            const index = this.globalProviders.indexOf(provider);
            if (index !== -1) this.globalProviders.splice(index, 1);
        };
    }

    public static fromEvent(event: KeybindEventLike & {target?: EventTarget | null}): KeybindContext {
        const target = event.target instanceof HTMLElement ? event.target : document.activeElement;
        return this.fromElement(target, event);
    }

    public static fromElement(element: Element | null, event: KeybindEventLike = {
        shiftKey: false,
        ctrlKey: false,
        altKey: false,
        metaKey: false,
        preventDefault: () => undefined,
        stopPropagation: () => undefined
    }): KeybindContext {
        const data = this.resolve(element);
        let descriptor = 0;
        if (data.has(CommonDataKeys.PANE)) descriptor |= KeybindContextDescriptor.IN_PANE;
        if (data.has(CommonDataKeys.EDITOR)) descriptor |= KeybindContextDescriptor.IN_MAIN_EDITOR;
        if (data.has(CommonDataKeys.TEXT_AREA)) descriptor |= KeybindContextDescriptor.IN_TEXT_AREA;
        return new KeybindContext(descriptor, event, data.get(CommonDataKeys.EDITOR) ?? null, data.get(CommonDataKeys.PANE) ?? null, data);
    }

    public static resolve(element: Element | null): DataContext {
        const providers: ContextProvider[] = [...this.globalProviders];
        let current: Element | null = element;
        while (current) {
            const provider = this.providers.get(current as HTMLElement);
            if (provider) providers.unshift(provider);
            current = current.parentElement;
        }

        const resolver: DataResolver = (key) => {
            for (const provider of providers) {
                const value = provider.provide(key);
                if (value !== undefined) return value;
            }
            return undefined;
        };
        return new DataContext(null, undefined, resolver);
    }

    public static provider(values: Partial<{editor: Editor; pane: IPane}>): ContextProvider {
        return {
            provide: (key) => {
                if (key === CommonDataKeys.EDITOR) return values.editor;
                if (key === CommonDataKeys.PANE) return values.pane;
                return undefined;
            }
        };
    }
}
