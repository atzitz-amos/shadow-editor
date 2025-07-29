import {ILexer} from "./ILexer";
import {TextRange} from "../../Position";

export class Token<Type> {
    isError = false;

    type: Type;
    value: string;
    range: TextRange;

    isSpecial: boolean;
    isComment: boolean;

    constructor(type: Type, value: string, range: TextRange, isSpecial: boolean = false, isComment: boolean = false) {
        this.type = type;
        this.value = value;
        this.range = range;
        this.isSpecial = isSpecial;
        this.isComment = isComment;
    }
}

export class ErrorToken<Type> extends Token<Type> {
    isError = true;
    msg: string;

    constructor(type: Type, value: string, msg: string, range: TextRange) {
        super(type, value, range, false, false);
        this.msg = msg;
    }
}

export class Source {
    src: string;
    index: Offset = 0;

    followupError: Token<any> | null = null;

    constructor(text: string) {
        this.src = text;
    }

    consume(): string | null {
        if (this.index >= this.src.length) {
            return null;
        }
        return this.src[this.index++];
    }

    seek(): string | null {
        if (this.index >= this.src.length) {
            return null;
        }
        return this.src[this.index];
    }

    seekNext(): string | null {
        return this.src[this.index + 1] || null;
    }

    find(char: string): Offset {
        return this.src.indexOf(char, this.index + 1);
    }

    slice(end: int) {
        return this.src.slice(this.index + 1, end);
    }

    jump(n: Offset) {
        this.index += n;
    }

    length(): int {
        return this.src.length - this.index;
    }

    isEmpty(): boolean {
        return this.index >= this.src.length;
    }

    clearError() {
        let error = this.followupError;
        this.followupError = null;
        return error;
    }
}


export abstract class TokenStream<Type> {
    skipSpecial: boolean = true;
    skipComments: boolean = true;

    static of<Type>(...tokens: Token<Type>[]): TokenStream<Type> {
        return new StaticTokenStream<Type>(tokens);
    }

    abstract isEmpty(): boolean;

    abstract seek(): Token<Type> | null;

    abstract seekIncludeSpecial(): Token<Type> | null;

    abstract seekN(n: number): Token<Type> | null;

    abstract seekPrevious(): Token<Type> | null;

    abstract consume(): Token<Type> | null;

    abstract exhaust(): Token<Type>[];

    abstract includeComments(): void;

    abstract includeSpecial(): void;

    abstract clone(): TokenStream<Type>;
}

export class StaticTokenStream<Type> extends TokenStream<Type> {
    private readonly tokens: Token<Type>[];
    private index: number = 0;

    constructor(tokens: Token<Type>[]) {
        super(); // Dummy lexer, not used in StaticTokenStream
        this.tokens = tokens;
    }

    clone(): TokenStream<Type> {
        return new StaticTokenStream<Type>(this.tokens.slice());
    }

    isEmpty(): boolean {
        return this.index >= this.tokens.length;
    }

    seek(): Token<Type> | null {
        return this.seekN(0);
    }

    seekIncludeSpecial(): Token<Type> | null {
        return this.tokens[this.index];
    }

    seekN(n: number): Token<Type> | null {
        let token: Token<Type>;
        let i = this.index + n;
        do {
            token = this.tokens[i];
            i += Math.sign(n) || 1; // Move to the next token in the direction of n
        } while (token && ((this.skipComments && token.isComment) || (this.skipSpecial && token.isSpecial)));
        return token || null;
    }

    seekPrevious(): Token<Type> | null {
        return this.seekN(-1);
    }

    consume(): Token<Type> | null {
        const token = this.seek();
        if (token) {
            this.index++;
        }
        return token;
    }

    exhaust(): Token<Type>[] {
        let index = this.index;
        while (!this.isEmpty()) {
            this.consume();
        }
        return this.tokens.slice(index);
    }

    includeComments(): void {
        this.skipComments = false;
    }

    includeSpecial(): void {
        this.skipSpecial = false;
    }

}

export class LazyTokenStream<Type> extends TokenStream<Type> {
    private readonly lexer: ILexer<Type>;
    private readonly src: Source;
    private tokens: Token<Type>[] = [];
    private index = 0;

    private computed = 0;

    constructor(lexer: ILexer<Type>, text: string, skipSpecial: boolean = true) {
        super();

        this.lexer = lexer;
        this.src = new Source(text);

        this.skipSpecial = skipSpecial;
    }

    clone() {
        const clone = new LazyTokenStream<Type>(this.lexer, this.src.src, this.skipSpecial);
        clone.index = this.index;
        clone.computed = this.computed;
        clone.tokens = [...this.tokens];
        if (!this.skipComments) clone.includeComments();
        return clone;
    }

    isEmpty(): boolean {
        return this.src.isEmpty() && !this.src.followupError;
    }

    consume(): Token<Type> | null {
        const token = this.seek();
        this.index++;
        this.computed--;
        return token;
    }

    seek(): Token<Type> | null {
        return this.seekN(0);
    }

    seekIncludeSpecial(): Token<Type> | null {
        let skip = this.skipSpecial;
        this.skipSpecial = false; // Temporarily disable skipping special tokens
        let token = this.seek();
        this.skipSpecial = skip; // Restore the original state

        return token;
    }

    seekN(n: number): Token<Type> | null {
        while (this.computed <= n) {
            this.compute();
        }
        return this.tokens[this.index + n] || null;
    }

    seekPrevious(): Token<Type> | null {
        return this.seekN(-1);
    }

    exhaust(): Token<Type>[] {
        let index = this.index;
        while (!this.isEmpty()) {
            this.compute();
        }
        return this.tokens.slice(index);
    }

    includeComments() {
        this.skipComments = false;
    }

    includeSpecial() {
        this.skipSpecial = false;
    }

    private compute() {
        const token = this.lexer.tokenize(this.src);
        if (!token) {
            return;
        }
        if (this.skipSpecial && token.isSpecial) {
            return this.compute();
        } else if (this.skipComments && token.isComment) {
            return this.compute();
        }
        this.computed++;
        this.tokens.push(token);
    }

}

