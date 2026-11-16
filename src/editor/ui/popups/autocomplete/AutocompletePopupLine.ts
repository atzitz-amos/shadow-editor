import {UIComponent} from "../../../../core/ui/engine/components/UIComponent";
import {CodeCompletionPresentation} from "../../../../lang/codeCompletion/item/presentation/CodeCompletionPresentation";
import {HTMLUtils} from "../../../../core/utils/HTMLUtils";

/**
 *
 * @author Atzitz Amos
 * @date 11/14/2026
 * @since 1.0.0
 */
export class AutocompletePopupLine extends UIComponent {

    constructor(private readonly presentation: CodeCompletionPresentation) {
        super(HTMLUtils.createDiv("autocomplete-popup-line"));
    }

    public draw(): void {
        const icon = this.presentation.getIcon();
        const title = this.presentation.getTitle();
        const details = this.presentation.getDetails();
        const source = this.presentation.getSource();

        this.setInnerHTML(`
            <div class="autocomplete-item-left">
                ${icon ? icon.toHTMLString() : ""}
                <span class="autocomplete-item-title">${title}</span>
                <span class="autocomplete-item-details">${details}</span>
            </div>
            <span class="autocomplete-item-source">${source}</span>
        `);
    }
}
