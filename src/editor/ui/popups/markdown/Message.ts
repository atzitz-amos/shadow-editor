export abstract class MarkdownPart {
    abstract render(): HTMLElement;
}

export class MarkdownMessage {
    parts: MarkdownPart[];

    constructor(parts: MarkdownPart[]) {
        this.parts = parts;
    }

    toHTML(): HTMLElement[] {
        return this.parts.map(x => x.render());
    }
}
