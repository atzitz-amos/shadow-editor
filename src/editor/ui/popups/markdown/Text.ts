import {MarkdownPart} from "./Message";

export class MarkdownText extends MarkdownPart {
    text: string;
    effects: MarkdownEffects;

    constructor(text: string, effects: MarkdownEffects) {
        super();

        this.text = text;
        this.effects = effects;
    }

    render(): HTMLElement {
        let elem = document.createElement("span")

        elem.innerText = this.text;
        this.effects.apply(elem);

        return elem;
    }
}

export class MarkdownEffects {
    private static HEADER_LEVEL_TO_ELEMENT = ["h1", "h2", "h3", "h4", "h5", "h6"];

    isBold: boolean;
    isItalic: boolean;
    isUnderline: boolean;
    isStrikethrough: boolean;

    myHeaderLevel: number;

    constructor(options: {
        bold?: boolean,
        italic?: boolean,
        underline?: boolean,
        strikethrough?: boolean,
        headerLevel?: number
    }) {
        this.isBold = options.bold ?? false;
        this.isItalic = options.italic ?? false;
        this.isUnderline = options.underline ?? false;
        this.isStrikethrough = options.strikethrough ?? false;
        this.myHeaderLevel = options.headerLevel ?? 3;
    }

    static none() {
        return new MarkdownEffects({});
    }

    static bold() {
        return new MarkdownEffects({bold: true});
    }

    static italic() {
        return new MarkdownEffects({italic: true});
    }

    static underline() {
        return new MarkdownEffects({underline: true});
    }

    static strikethrough() {
        return new MarkdownEffects({strikethrough: true});
    }

    static h1() {
        return new MarkdownEffects({headerLevel: 1});
    }

    static h2() {
        return new MarkdownEffects({headerLevel: 2});
    }

    static h3() {
        return new MarkdownEffects({headerLevel: 3});
    }

    static h4() {
        return new MarkdownEffects({headerLevel: 4});
    }

    static h5() {
        return new MarkdownEffects({headerLevel: 5});
    }

    static h6() {
        return new MarkdownEffects({headerLevel: 6});
    }


    bold(): MarkdownEffects {
        this.isBold = true;
        return this;
    }

    italic(): MarkdownEffects {
        this.isItalic = true;
        return this;
    }

    underline(): MarkdownEffects {
        this.isUnderline = true;
        return this;
    }

    strikethrough(): MarkdownEffects {
        this.isStrikethrough = true;
        return this;
    }

    headerLevel(value: number): MarkdownEffects {
        this.myHeaderLevel = value;
        return this;
    }

    h1() {
        this.myHeaderLevel = 1;
        return this;
    }

    h2() {
        this.myHeaderLevel = 2;
        return this;
    }

    h3() {
        this.myHeaderLevel = 3;
        return this;
    }

    h4() {
        this.myHeaderLevel = 4;
        return this;
    }

    h5() {
        this.myHeaderLevel = 5;
        return this;
    }

    h6() {
        this.myHeaderLevel = 6;
        return this;
    }

    apply(element: HTMLElement) {
        if (this.isBold) element.style.fontWeight = "bold";
        if (this.isItalic) element.style.fontStyle = "italic";
        if (this.isUnderline) element.style.textDecoration = "underline";
        if (this.isStrikethrough) element.style.textDecoration = "line-through";

        element.classList.add(MarkdownEffects.HEADER_LEVEL_TO_ELEMENT[this.myHeaderLevel - 1]);
    }
}