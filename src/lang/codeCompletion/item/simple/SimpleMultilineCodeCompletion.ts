import {SynModTree} from "../../../codeGen/modification/SynModTree";
import {SynPlaceholder} from "../../../codeGen/placeholder/SynPlaceholder";
import {SynParentElement} from "../../../syntax/api/tree/SynParentElement";
import {CodeCompletionItem} from "../CodeCompletionItem";
import {CodeCompletionPresentation} from "../presentation/CodeCompletionPresentation";
import {SimpleCodeCompletionPresentation} from "../presentation/SimpleCodeCompletionPresentation";
import {IndentUtils} from "../../../syntax/utils/IndentUtils";

/**
 *
 * @author Atzitz Amos
 * @date 11/14/2026
 * @since 1.0.0
 */
export class SimpleMultilineCodeCompletion extends CodeCompletionItem {
    private static readonly CARET = "$CARET";
    private static readonly INDENT = "$INDENT";

    /** Only known once applied, as it depends on the indentation of where the completion is inserted */
    private caretOffset: number | null = null;

    /**
     * @param value the completed text, which is what the prefix is matched against
     * @param template inserted right after `value`. Its first line continues the line of `value`; the following
     * ones are indented like that line, and no more. `$INDENT` is replaced by one level of indentation, as defined
     * by the code style of the language. `$CARET` is removed, and is where the caret ends up.
     */
    constructor(private readonly value: string, private readonly template: string) {
        super();

    }

    getCaretOffsetAfterApply(): number | null {
        return this.caretOffset;
    }

    getPresentation(): CodeCompletionPresentation {
        let lines = this.template.replaceAll("$INDENT", "").replaceAll("$CARET", "").split("\n")
        if (lines.length === 0) lines = [""];
        return new SimpleCodeCompletionPresentation(
            this.value,
            "",
            lines[0].trim() + (lines.length > 1 ? "..." : "") + (lines.length > 2 ? lines[lines.length - 1].trim() : ""),
            null);
    }

    isStillApplicable(text: string): boolean {
        return this.value.startsWith(text);
    }

    apply(parent: SynParentElement, placeholder: SynPlaceholder, synModTree: SynModTree): void {
        const lineIndent = IndentUtils.makeIndentString(IndentUtils.getIndentationForSynNode(parent));
        // One level of indentation: the size the language's code style manager defines
        const indent = IndentUtils.makeIndentString(
            IndentUtils.getLanguageSpecificIndentationSize(parent.getSynDocument().getLanguage())
        );

        const lines = this.template
            .replaceAll(SimpleMultilineCodeCompletion.INDENT, indent)
            .split("\n")
            // The first line is the rest of the line being completed, which is already indented
            .map((line, index) => index === 0 ? line : lineIndent + line);
        const text = this.value + lines.join("\n");

        // Computed on the final text, so that it accounts for the indentation added before the caret
        const caret = text.indexOf(SimpleMultilineCodeCompletion.CARET);
        this.caretOffset = caret >= 0 ? caret : null;

        synModTree.replacePlaceholderWithText(placeholder, text.replace(SimpleMultilineCodeCompletion.CARET, ""));
    }
}
