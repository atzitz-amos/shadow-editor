import {ILanguageLayer} from "../../../core/behaviors/lang/ILanguageLayer";
import {LanguageBase} from "../../../../core/lang/LanguageBase";
import {CharTypedBehavior} from "../../../core/behaviors/behavior/CharTypedBehavior";
import {CopyBehavior} from "../../../core/behaviors/behavior/CopyBehavior";
import {CtrlDeleteBehavior} from "../../../core/behaviors/behavior/CtrlDeleteBehavior";
import {CutBehavior} from "../../../core/behaviors/behavior/CutBehavior";
import {DeleteBackwardBehavior} from "../../../core/behaviors/behavior/DeleteBackwardBehavior";
import {DeleteForwardBehavior} from "../../../core/behaviors/behavior/DeleteForwardBehavior";
import {EnterPressedBehavior} from "../../../core/behaviors/behavior/EnterPressedBehavior";
import {PasteBehavior} from "../../../core/behaviors/behavior/PasteBehavior";
import {ShiftTabPressedBehavior} from "../../../core/behaviors/behavior/ShiftTabPressedBehavior";
import {TabPressedBehavior} from "../../../core/behaviors/behavior/TabPressedBehavior";
import {EditorBehavior} from "../../../core/behaviors/EditorBehavior";
import {BehaviorHandlingMode} from "../../../core/behaviors/manager/BehaviorHandlingMode";
import {GlobalState} from "../../../../core/global/GlobalState";

/**
 *
 * @author Atzitz Amos
 * @date 6/23/2026
 * @since 1.0.0
 */
export class StandardLanguageLayer implements ILanguageLayer {
    private language: LanguageBase;

    getCharTypedBehavior(): CharTypedBehavior {
        return CharTypedBehavior.wrapping(this, ctx => {
            for (const action of GlobalState.getLangSupport().getAllSmartInsertActions(this.language)) {
                if (action.isApplicable(ctx)) {
                    if (action.invoke(ctx) === BehaviorHandlingMode.HANDLED) return BehaviorHandlingMode.HANDLED;
                }
            }

            return BehaviorHandlingMode.FORWARD;
        });
    }

    getDeleteBackwardBehavior(): DeleteBackwardBehavior {
        return EditorBehavior.FORWARD_ALL;
    }

    getDeleteForwardBehavior(): DeleteForwardBehavior {
        return EditorBehavior.FORWARD_ALL;
    }

    getCtrlDeleteBehavior(): CtrlDeleteBehavior {
        return EditorBehavior.FORWARD_ALL;
    }

    getEnterPressedBehavior(): EnterPressedBehavior {
        return EditorBehavior.FORWARD_ALL;
    }

    getTabPressedBehavior(): TabPressedBehavior {
        return EditorBehavior.FORWARD_ALL;
    }

    getShiftTabPressedBehavior(): ShiftTabPressedBehavior {
        return EditorBehavior.FORWARD_ALL;
    }

    getCopyBehavior(): CopyBehavior {
        return EditorBehavior.FORWARD_ALL;
    }

    getCutBehavior(): CutBehavior {
        return EditorBehavior.FORWARD_ALL;
    }

    getPasteBehavior(): PasteBehavior {
        return EditorBehavior.FORWARD_ALL;
    }

    getLanguage(): LanguageBase {
        return this.language;
    }

    setLanguage(language: LanguageBase): void {
        this.language = language;
    }

}
