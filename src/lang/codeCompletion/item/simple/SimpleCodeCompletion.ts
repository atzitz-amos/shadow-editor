import {SynNode} from "../../../syntax/api/SynNode";
import {CodeCompletionItem} from "../CodeCompletionItem";
import {CodeCompletionPresentation} from "../presentation/CodeCompletionPresentation";
import {SimpleCodeCompletionPresentation} from "../presentation/SimpleCodeCompletionPresentation";
import {SynModTree} from "../../../codeGen/modification/SynModTree";
import {SynPlaceholder} from "../../../codeGen/placeholder/SynPlaceholder";

/**
 *
 * @author Atzitz Amos
 * @date 10/26/2026
 * @since 1.0.0
 */
export class SimpleCodeCompletion extends CodeCompletionItem {

    constructor(private readonly value: string) {
        super();
    }

    getPresentation(): CodeCompletionPresentation {
        return new SimpleCodeCompletionPresentation(this.value, "", "", null);
    }

    isStillApplicable(text: string): boolean {
        return this.value.startsWith(text);
    }

    apply(node: SynNode, placeholder: SynPlaceholder, synModTree: SynModTree): void {
        synModTree.replacePlaceholderWithText(placeholder, this.value)
    }
}
