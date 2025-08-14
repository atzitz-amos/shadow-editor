import {MarkdownMessage} from "./Message";
import {MarkdownEffects, MarkdownText} from "./Text";

export class Markdown {
    static parse(value: string) {
        // TODO
        return new MarkdownMessage([
            new MarkdownText(value, MarkdownEffects.none())
        ])
    }
}