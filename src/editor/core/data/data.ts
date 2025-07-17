import {RawEditorData} from "./raw";
import {Component} from "../../ui/components/Component";

export class EditorData {
    raw: RawEditorData;
    language: string = "plaintext";

    constructor(initialString: string) {
        this.raw = new RawEditorData(initialString);
    }

    setLanguage(language: string) {
        this.language = language;
    }

    setComponentsAtRange(begin: Offset, end: Offset, components: Component[]) {

    }
}