import {Token} from "../../syntax/builder/tokens/Token";
import {ASTType} from "../../syntax/builder/parser/nodes/ASTGrammar";
import {SynASTElement} from "../../syntax/api/tree/SynASTElement";
import {TokenType} from "../../syntax/builder/tokens/TokenType";

/**
 *
 * @author Atzitz Amos
 * @date 8/15/2026
 * @since 1.0.0
 */
export class SpacingRule {
    private beforeToken: TokenType | null = null;
    private afterToken: TokenType | null = null;
    private aroundToken: TokenType | null = null;

    private inConditions: ASTType[] = [];
    private ifCondition: ((prevToken: Token | null, nextToken: Token, synNode: SynASTElement) => boolean) | null = null;
    private priority: number = 0;

    private spacingResult: Spacing = Spacing.KEEP;

    constructor(protected readonly ruleName: string) {
    }

    public before(token: TokenType): this {
        this.beforeToken = token;
        return this;
    }

    public after(token: TokenType): this {
        this.afterToken = token;
        return this;
    }

    public around(token: TokenType): this {
        this.aroundToken = token;
        return this;
    }

    public in(astType: ASTType): this {
        this.inConditions.push(astType);
        return this;
    }

    public if(cond: (prevToken: Token | null, nextToken: Token, synNode: SynASTElement) => boolean): this {
        this.ifCondition = cond;
        return this;
    }

    public withPriority(priority: number): this {
        this.priority = priority;
        return this;
    }

    public noSpace(): this {
        this.spacingResult = Spacing.NONE;
        return this;
    }

    public space(): this {
        this.spacingResult = Spacing.ONE;
        return this;
    }

    public atLeastOneSpace(): this {
        this.spacingResult = Spacing.AT_LEAST_ONE;
        return this;
    }

    public keepSpace(): this {
        this.spacingResult = Spacing.KEEP;
        return this;
    }

    public setResult(result: Spacing): void {
        this.spacingResult = result;
    }

    public getPriority(): number {
        return this.priority;
    }

    public getResult(): Spacing {
        return this.spacingResult;
    }

    public getRuleName(): string {
        return this.ruleName;
    }

    public getBeforeToken(): TokenType | null {
        return this.beforeToken;
    }

    public getAfterToken(): TokenType | null {
        return this.afterToken;
    }

    public getAroundToken(): TokenType | null {
        return this.aroundToken;
    }

    public isBlankRule(): boolean {
        return this.beforeToken === null && this.afterToken === null && this.aroundToken === null;
    }

    public isApplicable(prevToken: Token | null, nextToken: Token, synNode: SynASTElement): boolean {
        if (!synNode.getASTNode) {
            console.log(synNode);
        }

        if (this.inConditions.length > 0 && !this.inConditions.includes(synNode.getASTNode().type)) {
            return false;
        } else if (this.ifCondition && !this.ifCondition(prevToken, nextToken, synNode)) {
            return false;
        } else if (this.isBlankRule() && prevToken?.getRange().intersects(synNode.getTextRange())) {
            return false;
        }
        return true;
    }
}

export enum Spacing {
    NONE,
    ONE,
    AT_LEAST_ONE,
    KEEP
}