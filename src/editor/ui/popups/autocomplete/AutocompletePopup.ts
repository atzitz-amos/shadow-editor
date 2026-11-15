import {UIComponent} from "../../../../core/ui/engine/components/UIComponent";
import {EditorInlinePopup} from "../EditorInlinePopup";
import {Editor} from "../../../Editor";
import {CloseOn} from "../../../../core/ui/api/Closeable";
import {CodeCompletionItem} from "../../../../lang/codeCompletion/item/CodeCompletionItem";
import {IdeList} from "../../../../core/ui/lib/lists/IdeList";
import {AutocompletePopupLine} from "./AutocompletePopupLine";

/**
 *
 * @author Atzitz Amos
 * @date 10/26/2026
 * @since 1.0.0
 */
export class AutocompletePopup extends EditorInlinePopup {

    constructor(editor: Editor, private elements: CodeCompletionItem[], private readonly acceptCallback: null | ((item: CodeCompletionItem | null) => void) = null) {
        super(editor, "autocomplete-popup", CloseOn.ESCAPE);
    }

    public draw(): void {
        const list = new IdeList(
            this.getUnderlyingElement(),
            this.elements,
            e => new AutocompletePopupLine(e.getPresentation())
        );
        list.setFocusOnClick(false);
        list.setOnValueConfirmed(item => {
            this.acceptCallback?.(item)
        });
        this.addChild(list);
        this.drawChildren();
    }

    clone(): UIComponent {
        return new AutocompletePopup(this.editor, this.elements, this.acceptCallback);
    }

    public getList(): IdeList<CodeCompletionItem> | null {
        return this.getChildren().find(child => child instanceof IdeList) as IdeList<CodeCompletionItem> | null;
    }

    setElements(items: CodeCompletionItem[]) {
        this.elements = items;
        this.getList()?.setElements(items);
    }
}