import {IdePopup, IdeResultPopup} from "./IdePopup";
import {GlobalState} from "../../../global/GlobalState";
import {SimpleTextInputPopup} from "./SimpleTextInputPopup";
import {Icon} from "../../icons/Icon";
import {SimpleConfirmPopup} from "./SimpleConfirmPopup";

/**
 *
 * @author Atzitz Amos
 * @date 6/17/2026
 * @since 1.0.0
 */
export class PopupUtilsCore {
    public static showPopup(popup: IdePopup): void {
        GlobalState.getUI().showPopup(popup);
    }

    public static async awaitPopup<R>(popup: IdeResultPopup<R>): Promise<R | null> {
        PopupUtilsCore.showPopup(popup);
        return await popup.awaitResult();
    }

    public static async askString(message: string, placeholder: string = "", icon: Icon | null = null): Promise<string | null> {
        return PopupUtilsCore.awaitPopup(new SimpleTextInputPopup(message, placeholder, icon));
    }

    public static async confirm(title: string, message: string): Promise<boolean> {
        return await PopupUtilsCore.awaitPopup(new SimpleConfirmPopup(title, message)) ?? false;
    }
}
