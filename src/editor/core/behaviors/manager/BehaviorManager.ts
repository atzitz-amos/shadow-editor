import {IEditorMode} from "../mode/IEditorMode";
import {ILanguageLayer} from "../lang/ILanguageLayer";
import {IBehaviorProvider} from "../IBehaviorProvider";
import {EditorBehaviorContext} from "../context/EditorBehaviorContext";
import {BehaviorHandlingMode} from "./BehaviorHandlingMode";
import {ClipboardBehaviorContext} from "../context/ClipboardBehaviorContext";
import {EditorDeleteContext} from "../context/EditorDeleteContext";
import {EditorCharTypedContext} from "../context/EditorCharTypedContext";
import {LanguageBase} from "../../../../core/lang/LanguageBase";

/**
 *
 * @author Atzitz Amos
 * @date 6/22/2026
 * @since 1.0.0
 */
export class BehaviorManager {
    private readonly modeStack: IEditorMode[] = [];
    private readonly languageLayer: ILanguageLayer;
    private readonly standardLayer: IBehaviorProvider;

    private languageLayerDisabled: boolean = true;

    constructor(languageLayer: ILanguageLayer, standardLayer: IBehaviorProvider) {
        this.languageLayer = languageLayer;
        this.standardLayer = standardLayer;
    }

    enterMode(mode: IEditorMode) {
        this.modeStack.push(mode);
    }

    exitMode() {
        if (this.modeStack.length !== 0) this.modeStack.pop();
    }

    setLanguage(language: LanguageBase | null) {
        if (language == null)
            this.languageLayerDisabled = true;
        else {
            this.languageLayerDisabled = false;
            this.languageLayer.setLanguage(language);
        }
    }

    invokeCharTyped(ctx: EditorCharTypedContext) {
        this.tryInvoke(b => b.getCharTypedBehavior().invoke(ctx));
    }

    invokeDeleteBackward(ctx: EditorDeleteContext) {
        this.tryInvoke(b => b.getDeleteBackwardBehavior().invoke(ctx));
    }

    invokeDeleteForward(ctx: EditorDeleteContext) {
        this.tryInvoke(b => b.getDeleteForwardBehavior().invoke(ctx));
    }

    invokeCtrlDelete(ctx: EditorDeleteContext) {
        this.tryInvoke(b => b.getCtrlDeleteBehavior().invoke(ctx));
    }

    invokeEnterPressed(ctx: EditorBehaviorContext) {
        this.tryInvoke(b => b.getEnterPressedBehavior().invoke(ctx));
    }

    invokeTabPressed(ctx: EditorBehaviorContext) {
        this.tryInvoke(b => b.getTabPressedBehavior().invoke(ctx));
    }

    invokeShiftTabPressed(ctx: EditorBehaviorContext) {
        this.tryInvoke(b => b.getShiftTabPressedBehavior().invoke(ctx));
    }

    invokeCopy(ctx: ClipboardBehaviorContext) {
        this.tryInvoke(b => b.getCopyBehavior().invoke(ctx));
    }

    invokeCut(ctx: ClipboardBehaviorContext) {
        this.tryInvoke(b => b.getCutBehavior().invoke(ctx));
    }

    invokePaste(ctx: ClipboardBehaviorContext) {
        this.tryInvoke(b => b.getPasteBehavior().invoke(ctx));
    }

    getLanguageLayer(): ILanguageLayer | null {
        return this.languageLayerDisabled ? null : this.languageLayer;
    }

    getCurrentMode(): IEditorMode | null {
        if (this.modeStack.length === 0) return null;
        return this.modeStack.pop()!;
    }

    private tryInvoke(func: (b: IBehaviorProvider) => BehaviorHandlingMode) {
        if (this.modeStack.length !== 0) {
            const mode = this.modeStack[this.modeStack.length - 1];
            if (func(mode) == BehaviorHandlingMode.HANDLED) return;
        }

        if (func(this.languageLayer) == BehaviorHandlingMode.HANDLED) return;

        func(this.standardLayer);
    }
}
