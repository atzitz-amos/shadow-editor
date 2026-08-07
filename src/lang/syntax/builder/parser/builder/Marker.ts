import {ASTBuilder} from "./ASTBuilder";
import {ASTType} from "../nodes/ASTGrammar";

export interface Marker {
    getLastTokenOffset(): number;

    getOffset(): number;

    getBuilderOffset(): number;

    wasErrorAt(): boolean;

    rollback(): void;

    getTokenIndex(): number;

    done(type: ASTType): void;
}

export class TokenStreamMarker implements Marker {
    constructor(private builder: ASTBuilder, private offset: number, private tokenOffset: number, private tokenAt: number, private builderOffset: number, private errorState: boolean = false) {
    }

    getLastTokenOffset(): number {
        return this.tokenOffset;
    }

    wasErrorAt(): boolean {
        return this.errorState;
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

    rollback(): void {
        this.builder.rollbackTo(this);
    }

    done(type: ASTType): void {
        this.builder.build(this, type);
    }
}