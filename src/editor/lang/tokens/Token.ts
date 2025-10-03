import {TokenType} from "./TokenType";
import {TextRange} from "../../core/coordinate/TextRange";

export class Token {
    private readonly isComment: boolean;
    private readonly _shouldSkip: boolean;

    constructor(private readonly type: TokenType, private readonly value: string, private readonly raw: string, private range: TextRange) {
        this._shouldSkip = type.shouldSkip;
        this.isComment = type.isComment;
    }

    static errorToken(value: string, range: TextRange): Token {
        return new Token(TokenType.UNEXPECTED, value, value, range);
    }

    public isType(type: TokenType) {
        return this.type === type;
    }

    public getType(): TokenType {
        return this.type;
    }

    public getValue(): string {
        return this.value;
    }

    public getRaw(): string {
        return this.raw;
    }

    public shouldSkip(): boolean {
        return this._shouldSkip;
    }

    public isCommentToken(): boolean {
        return this.isComment;
    }

    public getRange(): TextRange {
        return this.range;
    }
}