import {Plugin, PluginManager} from "../Plugins";

export class JSLangPlugin implements Plugin {
    name = 'js-lang-plugin';
    description = 'JavaScript Language Plugin for Editor';

    constructor() {
    }

    onRegistered(pluginManager: PluginManager) {
    }
}