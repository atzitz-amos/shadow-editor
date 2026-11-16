import {CodeCompletionItem} from "../../../../lang/codeCompletion/item/CodeCompletionItem";
import {CodeCompletionProvider} from "../../../../lang/codeCompletion/session/provider/CodeCompletionProvider";
import {LanguageBase} from "../../../../lang/LanguageBase";
import {SynParentElement} from "../../../../lang/syntax/api/tree/SynParentElement";
import {SynTokenNode} from "../../../../lang/syntax/impl/SynTokenNode";
import JsLang from "../../lang/JsLang";
import {JsIdentifier} from "../../lang/syntax/literal/JsIdentifier";
import {JsCodeBlock} from "../../lang/syntax/JsCodeBlock";
import {JsExprStatement} from "../../lang/syntax/statements/JsExprStatement";
import {JsDeclarator} from "../../lang/syntax/statements/JsDeclarator";
import {JsClassField} from "../../lang/syntax/objects/JsClassField";
import {SimplePostfixCodeCompletion} from "../../../../lang/codeCompletion/item/simple/SimplePostfixCodeCompletion";
import {SimpleMultilineCodeCompletion} from "../../../../lang/codeCompletion/item/simple/SimpleMultilineCodeCompletion";
import {JsIfStatement} from "../../lang/syntax/statements/JsIfStatement";
import {JsSynUtils} from "../../lang/syntax/utils/JsSynUtils";
import {JsFunction} from "../../lang/syntax/api/JsFunction";
import {FaIcon} from "../../../../core/ui/icons/FaIcon";

/**
 *
 * @author Atzitz Amos
 * @date 10/26/2026
 * @since 1.0.0
 */
export default class JsKeywordProvider extends CodeCompletionProvider {
    getApplicableLanguages(): LanguageBase[] {
        return [JsLang.INSTANCE];
    }

    isApplicable(parent: SynParentElement, placeholder: SynTokenNode, text: string): boolean {
        return parent instanceof JsIdentifier;
    }

    getCompletionItems(node: SynParentElement, placeholder: SynTokenNode, text: string): CodeCompletionItem[] {
        const parent = node.getParent();

        let completions: CodeCompletionItem[] = [];

        console.log(parent);

        if (!parent || parent instanceof JsExprStatement || parent instanceof JsCodeBlock) {
            completions = completions.concat(this.completeStatementStart(node, placeholder, text));
            completions = completions.concat(this.completeExpression(node, placeholder, text));

            if (parent?.previousSibling() instanceof JsIfStatement) {
                completions.push(new SimplePostfixCodeCompletion("else if", " ($CARET)").specificity(1));
                completions.push(new SimpleMultilineCodeCompletion("else", " {\n$INDENT$CARET\n}").specificity(1));
            }
        } else if (this.isExpressionPosition(node, parent))
            completions = this.completeExpression(node, placeholder, text);

        return completions;
    }

    /**
     * Whether `identifier` is where an expression goes in `parent`, as opposed to where a name does.
     * <p>
     * The parser only makes a JsIdentifier out of an identifier that is an expression: declared names,
     * parameters, object keys, destructuring patterns and member properties are plain tokens or have a node type
     * of their own, and never get here (see {@link isApplicable}). So an identifier is an expression wherever it
     * is, be it under another expression or not (`let x = |`, `return |`, `if (|)`), except in the few places
     * below where a name is a JsIdentifier too.
     */
    private isExpressionPosition(identifier: SynParentElement, parent: SynParentElement): boolean {
        if (parent instanceof JsDeclarator) return parent.getValue() === identifier;

        if (parent instanceof JsClassField) return this.isAfterEquals(identifier, parent);

        return true;
    }

    private isAfterEquals(node: SynParentElement, parent: JsClassField): boolean {
        for (const child of parent.getChildren()) {
            if (child === node) return false;
            if (child instanceof SynTokenNode && child.getValue() === "=") return true;
        }
        return false;
    }

    private completeStatementStart(node: SynParentElement, placeholder: SynTokenNode, text: string): CodeCompletionItem[] {
        return this.makeCompletions([
            ["let", " "],
            ["const", " "],
            ["function", " "],
            ["async function", " "],
            ["class", " "],
            ["if", " ($CARET)"],
            ["for", " ($CARET)"],
            ["while", " ($CARET)"],
            ["switch", " ($CARET)"],
            ["throw", " "],
            ["debugger", ";"]
        ]).concat(this.makeMultilineCompletions([
            ["do", " {\n$INDENT$CARET\n}"],
            ["try", " {\n$INDENT$CARET\n}"]
        ])).concat(this.getStatementStartContextGatedCompletions(node));
    }

    private completeExpression(node: SynParentElement, placeholder: SynTokenNode, text: string) {
        return this.makeCompletions([
            ["this", ""],
            ["null", ""],
            ["true", ""],
            ["false", ""],
        ]);
    }

    private makeCompletions(keywords: [string, string][]): CodeCompletionItem[] {
        return keywords.map(keyword =>
            new SimplePostfixCodeCompletion(keyword[0], keyword[1]));
    }

    private makeMultilineCompletions(keywords: [string, string][]): CodeCompletionItem[] {
        return keywords.map(keyword =>
            new SimpleMultilineCodeCompletion(keyword[0], keyword[1]));
    }

    private getStatementStartContextGatedCompletions(node: SynParentElement) {
        const parentFunc = <JsFunction | null>node.getEnclosingSuchThat(n => JsSynUtils.isFunction(n));
        const completions: CodeCompletionItem[] = [];
        if (parentFunc !== null) {
            completions.push(new SimplePostfixCodeCompletion("return", " $CARET").specificity(2));
            if (parentFunc.isAsync())
                completions.push(new SimplePostfixCodeCompletion("await", " $CARET").specificity(1));
            if (parentFunc.isGenerator())
                completions.push(new SimplePostfixCodeCompletion("yield", " $CARET").specificity(1));
        }

        return completions;
    }
}
