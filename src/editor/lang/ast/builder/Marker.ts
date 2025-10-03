import {Token} from "../../tokens/Token";
import {ASTBuilder} from "./ASTBuilder";
import {ASTType} from "../ASTGrammar";

export interface Marker {
    getOffset(): number;

    getBuilderOffset(): number;

    getTokenAt(): Token;

    getTokenBefore(): Token | null;

    getTokenAfter(): Token | null;

    rollback(): void;

    getTokenIndex(): number;

    done(type: ASTType): void;
}

export class TokenStreamMarker implements Marker {
    constructor(private builder: ASTBuilder, private offset: number, private tokenAt: number, private builderOffset: number) {
    }

    getTokenIndex(): number {
        return this.tokenAt;
    }

    getOffset(): number {
        return this.offset;
    }

    getBuilderOffset(): number {
        return this.builderOffset;
    }

    getTokenAt(): Token {
        return this.builder.getTokenAt(this.tokenAt)!;
    }

    getTokenBefore(): Token | null {
        return this.builder.getTokenAt(this.tokenAt - 1);
    }

    getTokenAfter(): Token | null {
        return this.builder.getTokenAt(this.tokenAt + 1);
    }

    rollback(): void {
        this.builder.rollbackTo(this);
    }

    done(type: ASTType): void {
        this.builder.build(this, type);
    }
}