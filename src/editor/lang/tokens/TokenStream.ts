import {Token} from "./Token";
import {OutdatedTokenStreamError} from "./OutdatedTokenStreamError";
import {TextRange} from "../../core/coordinate/TextRange";

export class Source {
    src: string;
    index: Offset = 0;
    startOffset: Offset;

    followupError: Token | null = null;

    constructor(text: string, startOffset: Offset = 0) {
        this.src = text;
        this.startOffset = startOffset;
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

    getOffset(): Offset {
        return this.index + this.startOffset;
    }

    getRange(start: Offset): TextRange {
        return new TextRange(start, this.getOffset());
    }
}


export abstract class TokenStream {
    static of(...tokens: Token[]): TokenStream {
        return new StaticTokenStream(tokens);
    }

    /**
     * Invalidate the TokenStream
     * An invalidated TokenStream should throw an {@link OutdatedTokenStreamError} when used.
     * */
    abstract invalidate(): void;

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

    public [Symbol.iterator](): Iterator<Token> {
        return {
            next: (): IteratorResult<Token> => {
                if (this.isEmpty()) {
                    return {value: null as any, done: true};
                } else {
                    return {value: this.consume()!, done: false};
                }
            }
        }
    }
}

export class StaticTokenStream extends TokenStream {
    private readonly tokens: Token[];
    private index: number = 0;

    private isInvalidated: boolean = false;

    constructor(tokens: Token[]) {
        super(); // Dummy lexer, not used in StaticTokenStream
        this.tokens = tokens;
    }

    invalidate(): void {
        this.isInvalidated = true;
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
        this.assertNotInvalid();

        if (index < 0 || index >= this.tokens.length) {
            throw new Error("Index out of bounds");
        }
        this.index = index;
    }

    clone(): TokenStream {
        this.assertNotInvalid();

        return new StaticTokenStream(this.tokens);
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
        this.assertNotInvalid();

        const token = this.seek();
        if (token) {
            this.index++;
        }
        return token;
    }

    exhaust(): Token[] {
        this.assertNotInvalid();

        return this.tokens;
    }

    private assertNotInvalid() {
        if (this.isInvalidated) {
            throw new OutdatedTokenStreamError();
        }
    }
}
