import {EditorPlugin} from "../../core/plugins/loader/Plugin";

export default class JSLangPlugin extends EditorPlugin {
    constructor() {
        super();
    }

    getStylesheets(): string[] {
        return ["src/plugins/jsLang/styles/jsLang.css"];
    }
}
