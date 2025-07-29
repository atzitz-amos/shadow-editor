import {PluginEventListener} from "../core/events/events";
import {Editor} from "../Editor";
import {ILexer} from "../core/lang/lexer/ILexer";
import {IHighlighter} from "../core/lang/highlighter/IHighlighter";
import {IParser} from "../core/lang/parser/IParser";

export interface Plugin extends PluginEventListener {
    name: string;
    description: string;
}


/**
 * Just so plugin don't need to implement EVERY listener.
 * */

export class PluginManager {
    editor: Editor;
    plugins: Record<string, Plugin>;

    lexerProviderMap: Map<string, () => ILexer<any>> = new Map();
    highlighterProviderMap: Map<string, () => IHighlighter<any>> = new Map();
    parserProviderMap: Map<string, () => any> = new Map(); // TODO

    constructor(editorInstance: Editor) {
        this.editor = editorInstance;
        this.plugins = {};
    }

    register(plugin: Plugin) {
        this.plugins[plugin.name] = plugin;
        plugin.onRegistered(this.editor, this);
    }

    registerFileTypeAssociation(
        fileType: string,
        lexerProvider: () => ILexer<any>,
        highlighterProvider?: () => IHighlighter<any>,
        parserProvider?: () => any
    ) {
        this.lexerProviderMap.set(fileType, lexerProvider);
        if (highlighterProvider) {
            this.highlighterProviderMap.set(fileType, highlighterProvider);
        }
        if (parserProvider) {
            this.parserProviderMap.set(fileType, parserProvider);
        }
    }

    getLexerForFileType(fileType: string): ILexer<any> | undefined {
        const provider = this.lexerProviderMap.get(fileType);
        if (provider) {
            return provider();
        }
        return undefined;
    }

    getHighlighterForFileType(fileType: string): IHighlighter<any> | undefined {
        const provider = this.highlighterProviderMap.get(fileType);
        if (provider) {
            return provider();
        }
        return undefined;
    }

    getParserForFileType(fileType: string): IParser<any> | undefined {
        const provider = this.parserProviderMap.get(fileType);
        if (provider) {
            return provider();
        }
        return undefined;
    }
}