/*
 * Author: Atzitz Amos
 * Date: 10/5/2025
 */

import {EditorPlugin} from "../loader/Plugin";
import {PluginManager} from "../PluginManager";
import {ExtensionPoint} from "./ExtensionPoint";
import {LanguageBase} from "../../lang/LanguageBase";
import {FileTypeHandler} from "../../lang/FileTypeHandler";
import {DefaultRegistry} from "../../utils/CollectionUtils";

export class LangExtensionPoint implements ExtensionPoint {
    private static readonly instance: LangExtensionPoint = new LangExtensionPoint();

    private readonly fileTypeHandlers = new DefaultRegistry<EditorPlugin, FileTypeHandler>();

    static get class(): ExtensionPoint {
        return LangExtensionPoint.instance;
    }

    getName(): string {
        return "lang";
    }

    register(manager: PluginManager, owner: EditorPlugin, instance: any): void {
        if (instance instanceof LanguageBase) {
            manager.getLanguageSupport().registerLanguage(instance);
        } else if (instance instanceof FileTypeHandler) {
            manager.getLanguageSupport().registerFileTypeHandler(instance);
            this.fileTypeHandlers.register(owner, instance);
        }
    }

    unregister(manager: PluginManager, owner: EditorPlugin): void {
        const handlers = this.fileTypeHandlers.getAll(owner);
        if (handlers.length) {
            for (const handler of handlers) {
                manager.getLanguageSupport().suppressFileTypeHandler(handler);
            }
            this.fileTypeHandlers.unregisterAll(owner);
        }
    }

}
