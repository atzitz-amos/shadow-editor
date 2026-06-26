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
import {KeyReleasedEvent, MouseMovedEvent} from "../../events/PhysicalEvents";
import {LangSupport} from "../../../../core/lang/LangSupport";
import {TokenHoverAction} from "../../../../core/lang/tokenhover/TokenHoverAction";
import {Token} from "../../../../core/lang/syntax/builder/tokens/Token";
import {EditorBehaviorContext} from "../../../core/behaviors/context/EditorBehaviorContext";

/**
 *
 * @author Atzitz Amos
 * @date 6/23/2026
 * @since 1.0.0
 */
export class StandardLanguageLayer implements ILanguageLayer {
    private language: LanguageBase;

    private tokenHoverTimeouts: NodeJS.Timeout[] = [];
    private activeTokenHovers: TokenHoverAction[] = [];
    private activeHoverToken: Token | null = null;

    constructor() {
        GlobalState.getMainEventBus().subscribe(this, MouseMovedEvent.SUBSCRIBER, e => this.onMouseMoved(e));
        GlobalState.getMainEventBus().subscribe(this, KeyReleasedEvent.SUBSCRIBER, e => this.onKeyReleased(e));
    }

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

    private onMouseMoved(event: MouseMovedEvent) {
        const editor = event.getEditor();
        const ctx = new EditorBehaviorContext(editor, editor.getPrimaryCaret());

        // CLEANUP START
        for (const timeout of this.tokenHoverTimeouts) {
            clearTimeout(timeout);
        }
        this.tokenHoverTimeouts = [];

        // CLEANUP END
        const offset = editor.xyToExactOffset(event.getRelativeXY());
        if (!offset) return this.cleanupTokenHovers(ctx, null);

        const tokenAt = editor.getOpenedDocument().getTokenAt(offset);
        this.cleanupTokenHovers(ctx, tokenAt);
        if (!tokenAt) return;


        const tokenHovers = LangSupport.getInstance().getAllTokenHoverActions(this.language);

        for (const tokenHover of tokenHovers) {
            if (!this.hoverRequirementsSatisfied(tokenHover, tokenAt, event.getEvent())) continue;

            if (tokenHover.isApplicable(ctx, tokenAt)) {
                this.tokenHoverTimeouts.push(setTimeout(() => {
                    this.activeTokenHovers.push(tokenHover);
                    tokenHover.execute(ctx, editor.getLangService().getSynFile(), tokenAt);
                }, tokenHover.getDelay()));
            }
        }
    }

    private cleanupTokenHovers(ctx: EditorBehaviorContext, tokenAt: Token | null) {
        if (tokenAt === this.activeHoverToken) return;
        for (const hover of this.activeTokenHovers) {
            hover.cleanup(ctx);
        }
        this.activeTokenHovers = [];
        this.activeHoverToken = tokenAt;
    }

    private hoverRequirementsSatisfied(tokenHover: TokenHoverAction, token: Token, event: any) {
        return (!tokenHover.requiresAlt(token) || event.altKey)
            && (!tokenHover.requiresShift(token) || event.shiftKey)
            && (!tokenHover.requiresControl(token) || event.ctrlKey);

    }

    private onKeyReleased(event: KeyReleasedEvent) {
        const ctx = new EditorBehaviorContext(event.getEditor(), event.getEditor().getPrimaryCaret());

        const newHovers: TokenHoverAction[] = [];
        for (const hover of this.activeTokenHovers) {
            if (this.hoverRequirementsSatisfied(hover, this.activeHoverToken!, event.getEvent())) {
                newHovers.push(hover);
            } else {
                hover.cleanup(ctx);
            }
        }

        this.activeTokenHovers = newHovers;
    }
}
