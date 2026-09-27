import {UIComponent} from "../../../../core/ui/engine/components/UIComponent";
import {EditorInlinePopup} from "../EditorInlinePopup";
import {Editor} from "../../../Editor";
import {CloseOn} from "../../../../core/ui/api/Closeable";
import {IdeSearchableList} from "../../../../core/ui/lib/lists/IdeSearchableList";
import {Describable} from "../../../../core/ui/api/Describable";

/**
 *
 * @author Atzitz Amos
 * @date 9/19/2026
 * @since 1.0.0
 */
export class ContextActionsPopup<T extends Describable> extends EditorInlinePopup {
    private actionChosenCallback: ((selected: T | null) => void) | null = null;

    public constructor(editor: Editor, private readonly elements: T[]) {
        super(editor, "context-actions-popup", CloseOn.DEFAULT)
    }

    public setOnActionChosen(callback: (selected: T | null) => void): void {
        this.actionChosenCallback = callback;
    }

    public draw(): void {
        // this.setInnerHTML(`
        // <div class="context-actions-popup-content">
        //     <div class="context-actions-popup-item">Action 1</div>
        //     <div class="context-actions-popup-item">Action 2</div>
        //     <div class="context-actions-popup-item">Action 3</div>
        // </div>`);

        const searchableList = new IdeSearchableList(this.getUnderlyingElement(), this.elements);
        searchableList.setOnValueConfirmed(element => {
            if (this.actionChosenCallback) this.actionChosenCallback(element as T)
        })

        this.addChild(searchableList);
        this.drawChildren();

        setTimeout(() => searchableList.focus(), 0);
    }

    clone(): UIComponent {
        return new ContextActionsPopup(this.editor, this.elements);
    }

}
