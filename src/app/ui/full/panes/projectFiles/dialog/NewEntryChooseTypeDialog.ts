import {AbstractDialog, IdeResultDialog} from "../../../../../../core/ui/lib/dialog/IdeDialog";
import {FileSystemEntryType} from "../../../../../core/projectFiles/entryType/FileSystemEntryType";
import {HTMLUtils} from "../../../../../../editor/utils/HTMLUtils";
import {FileSystemEntryTypesRegistry} from "../../../../../core/projectFiles/entryType/FileSystemEntryTypesRegistry";
import {IdeSearchableList} from "../../../../../../core/ui/lib/lists/IdeSearchableList";

/**
 *
 * @author Atzitz Amos
 * @date 9/12/2026
 * @since 1.0.0
 */
export class NewEntryChooseTypeDialog extends AbstractDialog implements IdeResultDialog<FileSystemEntryType> {
    private readonly popupElement: HTMLElement = HTMLUtils.createDiv("new-entry-type-chooser-popup");

    private readonly list: IdeSearchableList<FileSystemEntryType>;

    constructor() {
        super();

        const entryTypes = FileSystemEntryTypesRegistry.getAllFileSystemEntryTypes();

        const title = HTMLUtils.createDiv("new-entry-type-chooser-title", this.popupElement);
        title.innerText = "New entry";

        this.list = new IdeSearchableList(this.popupElement, entryTypes);
        this.list.setOnValueConfirmed(() => this.close(false));

        setTimeout(() => this.list.focus(), 0);
        this.list.draw();
    }

    awaitResult(): Promise<FileSystemEntryType | null> {
        return new Promise((resolve) => {
            this.onClose(wasCancelled => {
                if (wasCancelled) {
                    resolve(null);
                } else {
                    resolve(this.list.getValue());
                }
            })
        });
    }

    protected getPopupElement(): HTMLElement {
        return this.popupElement;
    }
}
