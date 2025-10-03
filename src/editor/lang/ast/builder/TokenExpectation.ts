import {ASTBuilder} from "./ASTBuilder";
import {Token} from "../../tokens/Token";
import {TokenType} from "../../tokens/TokenType";

export class TokenExpectation {
    constructor(private builder: ASTBuilder, private token: Token | null, private wasExpected: boolean) {

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
        if (this.token && this.wasExpected) {
            return this;
        }
        if (!this.token)
            this.builder.error(message || "Unexpected end of input");
        else
            this.builder.errorOn(this.token, message || "Unexpected token");
        return this;
    }

    then(type: TokenType, value: string | null = null, shouldConsumeOnError: boolean = false): TokenExpectation {
        if (!this.token || !this.wasExpected) {
            return this;
        }
        return this.builder.expect(type, value, shouldConsumeOnError);
    }
}