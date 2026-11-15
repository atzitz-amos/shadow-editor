import {CodeCompletionPresentation} from "./presentation/CodeCompletionPresentation";
import {SynModTree} from "../../codeGen/modification/SynModTree";
import {Describable} from "../../../core/ui/api/Describable";
import {Icon} from "../../../core/ui/icons/Icon";
import {SynParentElement} from "../../syntax/api/tree/SynParentElement";
import {SynPlaceholder} from "../../codeGen/placeholder/SynPlaceholder";

/**
 *
 * @author Atzitz Amos
 * @date 10/25/2026
 * @since 1.0.0
 */
export abstract class CodeCompletionItem implements Describable {
    private _specificity: number = -1;

    getSpecificity(): number {
        return this._specificity;
    }

    specificity(s: number) {
        this._specificity = s;
        return this;
    }

    getDescription(): string {
        return this.getPresentation().getTitle();
    }

    getIcon(): Icon | null {
        return this.getPresentation().getIcon();
    }

    abstract getPresentation(): CodeCompletionPresentation;

    abstract isStillApplicable(text: string): boolean;

    /**
     * Records the modifications of this completion in `synModTree`. The placeholder must be replaced by exactly
     * one modification.
     */
    abstract apply(parent: SynParentElement, placeholder: SynPlaceholder, synModTree: SynModTree): void;

    /**
     * Where to put the caret once the completion was applied, as an offset from the start of the text that
     * replaced the placeholder (e.g. 3 to end up between the parentheses of `if ()`).
     * <p>
     * Null, the default, leaves the caret after the inserted text.
     * <p>
     * Always called after {@link apply}, so an offset that depends on where the completion is inserted (e.g. on
     * the indentation) can be computed there.
     */
    getCaretOffsetAfterApply(): number | null {
        return null;
    }
}