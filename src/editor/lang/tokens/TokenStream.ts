import {Token} from "./Token";
import {ILexer} from "../lexer/ILexer";

export class Source {
    src: string;
    index: Offset = 0;

    followupError: Token | null = null;

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

    getRemaining() {
        return this.src.slice(this.index);
    }
}


export abstract class TokenStream {
    static of(...tokens: Token[]): TokenStream {
        return new StaticTokenStream(tokens);
    }

    abstract getIndex(): number;

    abstract isEmpty(): boolean;

    abstract seek(): Token | null;

    abstract seekN(n: number): Token | null;

    abstract seekPrevious(): Token | null;

    abstract getAt(index: number): Token | null;

    abstract rollbackTo(index: number): void;

    abstract consume(): Token | null;

    abstract exhaust(): Token[];

    abstract clone(): TokenStream;

    abstract getBetween(start: number, end: number): Token[];
}

export class StaticTokenStream extends TokenStream {
    private readonly tokens: Token[];
    private index: number = 0;

    constructor(tokens: Token[]) {
        super(); // Dummy lexer, not used in StaticTokenStream
        this.tokens = tokens;
    }

    getBetween(start: number, end: number): Token[] {
        return this.tokens.slice(start, end);
    }

    getIndex(): number {
        return this.index;
    }

    getAt(index: number): Token | null {
        return this.tokens[index] || null;
    }

    rollbackTo(index: number): void {
        if (index < 0 || index >= this.tokens.length) {
            throw new Error("Index out of bounds");
        }
        this.index = index;
    }

    clone(): TokenStream {
        return new StaticTokenStream(this.tokens.slice());
    }

    isEmpty(): boolean {
        return this.index >= this.tokens.length;
    }

    seek(): Token | null {
        return this.seekN(0);
    }

    seekN(n: number): Token | null {
        let token: Token;
        token = this.tokens[this.index + n];
        return token || null;
    }

    seekPrevious(): Token | null {
        return this.seekN(-1);
    }

    consume(): Token | null {
        const token = this.seek();
        if (token) {
            this.index++;
        }
        return token;
    }

    exhaust(): Token[] {
        let index = this.index;
        while (!this.isEmpty()) {
            this.consume();
        }
        return this.tokens.slice(index);
    }
}

export class LazyTokenStream extends TokenStream {
    private readonly lexer: ILexer;
    private readonly src: Source;
    private tokens: Token[] = [];
    private index = 0;
    private computed = 0;

    constructor(lexer: ILexer, text: string, skipSpecial: boolean = true) {
        super();

        this.lexer = lexer;
        this.src = new Source(text);
    }

    getBetween(start: number, end: number): Token[] {
        while (this.computed <= end) {
            this.compute();
        }
        return this.tokens.slice(start, end);
    }

    getIndex(): number {
        return this.index;
    }

    getAt(index: number): Token | null {
        while (this.computed <= index) {
            this.compute();
        }
        return this.tokens[index] || null;
    }

    rollbackTo(index: number): void {
        if (index < 0 || index >= this.tokens.length) {
            throw new Error("Index out of bounds");
        }
        this.computed += this.index - index;
        this.index = index;
    }

    clone() {
        const clone = new LazyTokenStream(this.lexer, this.src.src);
        clone.index = this.index;
        clone.computed = this.computed;
        clone.tokens = [...this.tokens];
        return clone;
    }

    isEmpty(): boolean {
        return this.index >= this.tokens.length && this.src.isEmpty();
    }

    consume(): Token | null {
        const token = this.seek();
        if (!token) {
            return null;
        }
        this.index++;
        this.computed--;
        return token;
    }

    seek(): Token | null {
        return this.seekN(0);
    }

    seekN(n: number): Token | null {
        if (this.isEmpty()) return null;
        while (this.computed <= n) {
            this.compute();
        }
        return this.tokens[this.index + n] || null;
    }

    seekPrevious(): Token | null {
        return this.seekN(-1);
    }

    exhaust(): Token[] {
        let tokens: Token[] = [];
        while (!this.isEmpty()) {
            tokens.push(this.consume()!);
        }
        return tokens;
    }

    private compute() {
        const token = this.lexer.tokenize(this.src);
        if (!token) {
            return;
        }
        this.computed++;
        this.tokens.push(token);
    }
}

