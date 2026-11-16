import {SynModTree} from "../../../codeGen/modification/SynModTree";
import {SynPlaceholder} from "../../../codeGen/placeholder/SynPlaceholder";
import {SynParentElement} from "../../../syntax/api/tree/SynParentElement";
import {CodeCompletionItem} from "../CodeCompletionItem";
import {CodeCompletionPresentation} from "../presentation/CodeCompletionPresentation";
import {SimpleCodeCompletionPresentation} from "../presentation/SimpleCodeCompletionPresentation";
import {Icon} from "../../../../core/ui/icons/Icon";

/**
 *
 * @author Atzitz Amos
 * @date 11/7/2026
 * @since 1.0.0
 */
export class SimplePostfixCodeCompletion extends CodeCompletionItem {
    private icon: Icon | null = null;

    /**
     * @param value the completed text, which is what the prefix is matched against
     * @param postfix inserted right after `value`
     * between the parentheses). Defaults to after the postfix.
     */
    constructor(private readonly value: string,
                private readonly postfix: string) {
        super();
    }

    getCaretOffsetAfterApply(): number | null {
        return this.postfix.indexOf("$CARET") >= 0
            ? this.value.length + this.postfix.indexOf("$CARET")
            : null;
    }

    getPresentation(): CodeCompletionPresentation {
        return new SimpleCodeCompletionPresentation(this.value, "", this.postfix.replace("$CARET", "").trim(), this.icon);
    }

    isStillApplicable(text: string): boolean {
        return this.value.startsWith(text);
    }

    withIcon(icon: Icon) {
        this.icon = icon;
        return this;
    }

    apply(parent: SynParentElement, placeholder: SynPlaceholder, synModTree: SynModTree): void {
        synModTree.replacePlaceholderWithText(placeholder, this.value + this.postfix.replace("$CARET", ""));
    }

}
