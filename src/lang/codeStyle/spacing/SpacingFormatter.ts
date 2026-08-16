import {Spacing, SpacingRule} from "./SpacingRule";
import {TokenType} from "../../syntax/builder/tokens/TokenType";
import {DefaultRegistry} from "../../../editor/utils/collection/DefaultRegistry";
import {TokenStream} from "../../syntax/builder/tokens/TokenStream";
import {SynTree} from "../../syntax/api/tree/SynTree";
import {SynTreeTokenJumper} from "../utils/SynTreeTokenJumper";
import {Token} from "../../syntax/builder/tokens/Token";
import {SynASTElement} from "../../syntax/api/tree/SynASTElement";
import {SynASTElementImpl} from "../../syntax/impl/tree/SynASTElementImpl";

/**
 *
 * @author Atzitz Amos
 * @date 8/15/2026
 * @since 1.0.0
 */
export class SpacingFormatter {
    private readonly blankRules: SpacingRule[] = [];
    private readonly beforeRules: DefaultRegistry<TokenType, SpacingRule> = new DefaultRegistry()
    private readonly afterRules: DefaultRegistry<TokenType, SpacingRule> = new DefaultRegistry();

    constructor(rules: SpacingRule[], private readonly whitespaceGroup: TokenType[], private readonly newlineGroup: TokenType[]) {
        for (const rule of rules) {
            if (rule.isBlankRule()) {
                this.blankRules.push(rule);
            } else if (rule.getBeforeToken() !== null) {
                this.beforeRules.register(rule.getBeforeToken()!, rule);
            } else if (rule.getAfterToken() !== null) {
                this.afterRules.register(rule.getAfterToken()!, rule);
            } else if (rule.getAroundToken() !== null) {
                this.beforeRules.register(rule.getAroundToken()!, rule);
                this.afterRules.register(rule.getAroundToken()!, rule);
            }
        }
    }

    public static make(cls: Constructor, whitespaceGroup: TokenType[], newlineGroup: TokenType[]): SpacingFormatter {
        const rules: SpacingRule[] = [];
        for (const key of Object.getOwnPropertyNames(cls)) {
            const value = (cls as any)[key];
            if (value instanceof SpacingRule) {
                rules.push(value);
            }
        }

        return new SpacingFormatter(rules,whitespaceGroup, newlineGroup);
    }

    public format(stream: TokenStream, tree: SynTree) {
        const jumper = new SynTreeTokenJumper(tree);

        let result = "";

        let isLineBegin: boolean = true;
        let currentWhitespace: Token | null = null;
        let prevToken: Token | null = null;
        let prevNode: SynASTElement | null = null;
        let index = 0;

        for (const token of stream) {
            if (token.shouldSkip()) {
                if (this.whitespaceGroup.includes(token.getType())) currentWhitespace = token;
                else {
                    result += token.getValue();
                    currentWhitespace = null;
                    prevNode = null;
                    prevToken = null;
                    isLineBegin = this.newlineGroup.includes(token.getType());
                }
                index++;
                continue;
            }

            let applicableRule: SpacingRule | null = null;

            const node = jumper.jumpToToken(token);
            if (isLineBegin) {
                isLineBegin = false; // never space line begin, that's up to indentation
            } else if (node instanceof SynASTElementImpl) {
                for (const rule of this.blankRules) {
                    if (rule.isApplicable(prevToken, token, node) && rule.getPriority() > (applicableRule?.getPriority() ?? -10)) {
                        applicableRule = rule;
                    }
                }

                for (const rule of this.beforeRules.getAll(token.getType())) {
                    if (rule.isApplicable(prevToken, token, node) && rule.getPriority() > (applicableRule?.getPriority() ?? -10)) {
                        applicableRule = rule;
                    }
                }


                if (prevToken) {
                    for (const rule of this.afterRules.getAll(prevToken.getType())) {
                        if (rule.isApplicable(prevToken, token, prevNode!) && rule.getPriority() > (applicableRule?.getPriority() ?? -10)) {
                            applicableRule = rule;
                        }
                    }
                }
            }

            if (applicableRule) {
                result += this.apply(applicableRule, currentWhitespace ? currentWhitespace.getValue() : "");
            } else {
                if (currentWhitespace) result += currentWhitespace.getValue(); // Default: Keep the whitespace
            }

            result += token.getValue();

            currentWhitespace = null;
            prevNode = node;
            prevToken = token;
        }

        return result;
    }

    private apply(applicableRule: SpacingRule, current: string) {
        switch (applicableRule.getResult()) {
            case Spacing.KEEP:
                return current;
            case Spacing.ONE:
                return " ";
            case Spacing.NONE:
                return "";
            case Spacing.AT_LEAST_ONE:
                return current.length > 0 ? current : " ";
        }
    }
}
