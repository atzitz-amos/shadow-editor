import {IdeDialog, IdeResultDialog} from "../IdeDialog";
import {GlobalState} from "../../../../global/GlobalState";
import {SimpleTextInputDialog} from "../simple/SimpleTextInputDialog";
import {Icon} from "../../../icons/Icon";
import {SimpleConfirmDialog} from "../simple/SimpleConfirmDialog";

/**
 *
 * @author Atzitz Amos
 * @date 6/17/2026
 * @since 1.0.0
 */
export class IdeDialogUtilsCore {
    public static showDialog(popup: IdeDialog): void {
        GlobalState.getUI().showDialog(popup);
    }

    public static async awaitDialog<R>(popup: IdeResultDialog<R>): Promise<R | null> {
        IdeDialogUtilsCore.showDialog(popup);
        return await popup.awaitResult();
    }

    public static async askString(message: string, placeholder: string = "", icon: Icon | null = null): Promise<string | null> {
        return IdeDialogUtilsCore.awaitDialog(new SimpleTextInputDialog(message, placeholder, icon));
    }

    public static async confirm(title: string, message: string): Promise<boolean> {
        return await IdeDialogUtilsCore.awaitDialog(new SimpleConfirmDialog(title, message)) ?? false;
    }

    public static isOpen(popup: Class<IdeDialog>): boolean {
        return GlobalState.getUI().getActiveDialog() instanceof popup;
    }

    public static closeDialog(popup: Class<IdeDialog>, wasCancelled: boolean = true): void {
        const activePopup = GlobalState.getUI().getActiveDialog();
        if (activePopup instanceof popup) {
            activePopup.close(wasCancelled);
        }
    }
}
