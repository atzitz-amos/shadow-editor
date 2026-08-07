export class TokenType {
    public static readonly EOF = new TokenType("EOF", /$/, null, 100);
    public static readonly UNEXPECTED = new TokenType("UNEXPECTED", /./, null, -1, true);

    constructor(
        public debugName: string,
        public matcher: RegExp,
        public getValue: ((match: RegExpExecArray) => string) | null,
        public priority: number = 0,
        public shouldSkip: boolean = false,
        public isComment: boolean = false
    ) {
    }
}

export class LexicalBuilder {
    public static make(name: string, matcher: RegExp, getValue: ((match: RegExpExecArray) => string) | null = null): TokenType {
        return new TokenType(name, matcher, getValue);
    }

    public static makeSkippable(name?: string, matcher: RegExp = /\s+/): TokenType {
        return new TokenType(name ?? "WHITESPACE", matcher, null, 0, true, false);
    }

    public static makeComment(name: string, matcher: RegExp, getValue: ((match: RegExpExecArray) => string) | null = null): TokenType {
        return new TokenType(name, matcher, getValue, 0, false, true);
    }
}
