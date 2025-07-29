import {Plugin, PluginManager} from "../../plugins/Plugins";
import {JSLexer} from "./jsLexer";
import {JSHighlighter} from "./jsHighlighter";
import {JsParser} from "./jsParser";
import {Editor} from "../../Editor";

export class JSLangPlugin implements Plugin {
    name = 'js-lang-plugin';
    description = 'JavaScript Language Plugin for Editor';

    constructor() {
    }

    onRegistered(editor: Editor, pluginManager: PluginManager) {
        pluginManager.registerFileTypeAssociation(
            "js",
            () => new JSLexer(),
            () => new JSHighlighter(),
            () => new JsParser()
        );
    }
}