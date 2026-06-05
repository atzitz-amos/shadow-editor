import {EditorPlugin} from "../../core/plugins/loader/Plugin";

export default class JSLangPlugin extends EditorPlugin {
    getId(): string {
        return "default.jsLang";
    }
}
