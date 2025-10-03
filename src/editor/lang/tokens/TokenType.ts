import {LanguageBase} from "../LanguageBase";

export class TokenType {
    public static readonly EOF = new TokenType(null as any, "EOF", /$/, null, 100);
    public static readonly UNEXPECTED = new TokenType(null as any, "UNEXPECTED", /./, null, -1, true);

    constructor(
        public language: LanguageBase,
        public debugName: string,
        public matcher: RegExp,
        public getValue: ((match: RegExpExecArray) => string) | null,
        public priority: number = 1,
        public shouldSkip: boolean = false,
        public isComment: boolean = false
    ) {
    }

    public static createLanguageBuilder(language: LanguageBase) {
        return new TokenTypeBuilder(language);
    }
}

export class TokenTypeBuilder {
    private priority: number = 0;

    constructor(private language: LanguageBase) {

    }


    public make(name: string, matcher: RegExp, getValue: ((match: RegExpExecArray) => string) | null = null): TokenType {
        return new TokenType(this.language, name, matcher, getValue, this.priority);
    }

    public makeSkippable(name?: string, matcher: RegExp = /\s+/): TokenType {
        return new TokenType(this.language, name ?? "WHITESPACE", matcher, null, this.priority, true, false);
    }

    public makeComment(name: string, matcher: RegExp, getValue: ((match: RegExpExecArray) => string) | null = null): TokenType {
        return new TokenType(this.language, name, matcher, getValue, this.priority, false, true);
    }
}
