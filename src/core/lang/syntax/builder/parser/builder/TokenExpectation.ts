import {ASTBuilder} from "./ASTBuilder";
import {Token} from "../../tokens/Token";
import {TokenType} from "../../tokens/TokenType";

export class TokenExpectation {
    constructor(private builder: ASTBuilder, private token: Token | null, private wasExpected: boolean, private shouldNotify = true) {

    }

    private static noPropagation(builder: ASTBuilder) {
        return new TokenExpectation(builder, null, false, false);
    }

    isValid(): boolean {
        return this.token !== null;
    }

    isFollowedBy(type: TokenType, value: string | null = null): boolean {
        return this.token !== null && this.wasExpected && this.builder.isNext(type, value);
    }

    orNull(): Token | null {
        return this.wasExpected ? this.token : null;
    }

    orError(message: string | null = null): Token | null {
        if (this.token && this.wasExpected) {
            return this.token;
        }
        if (!this.token)
            this.builder.error(message || "Unexpected token");
        else
            this.builder.errorOn(this.token, message || "Unexpected token");
        return null;
    }

    require(): Token {
        return this.token!;
    }

    failWith(message: string | null = null): TokenExpectation {
        if ((this.token && this.wasExpected) || !this.shouldNotify) {
            return this;
        }
        if (!this.token)
            this.builder.error(message || "Unexpected end of input");
        else
            this.builder.errorOn(this.token, message || "Unexpected token");
        return this;
    }

    then(callback: () => void): TokenExpectation;

    then(type: TokenType, value?: string | null, shouldConsumeOnError?: boolean): TokenExpectation;

    then(typeOrCallback: TokenType | (() => void), value: string | null = null, shouldConsumeOnError: boolean = false): TokenExpectation {
        if (typeOrCallback instanceof TokenType) {
            if (!this.token || !this.wasExpected) {
                return TokenExpectation.noPropagation(this.builder);
            }
            return this.builder.expect(typeOrCallback, value, shouldConsumeOnError);
        }
        if (!this.token || !this.wasExpected) {
            return TokenExpectation.noPropagation(this.builder);
        }
        typeOrCallback();
        if (this.builder.wasInvalid()) {
            return TokenExpectation.noPropagation(this.builder);
        }
        return this;
    }
}