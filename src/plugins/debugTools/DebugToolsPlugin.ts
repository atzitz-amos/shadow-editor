import {EditorPlugin} from "../../core/plugins/loader/Plugin";

export default class DebugToolsPlugin extends EditorPlugin {
    getId(): string {
        return "default.debug-tools";
    }
}