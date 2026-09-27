import {AbstractAction} from "./AbstractAction";
import {LanguageBase} from "../../lang/LanguageBase";
import {KeybindContext} from "../keybinds/context/KeybindContext";

/**
 *
 * @author Atzitz Amos
 * @date 9/27/2026
 * @since 1.0.0
 */
export abstract class LanguageSpecificAction extends AbstractAction {
    abstract getApplicableLanguages(): LanguageBase[];

    abstract doRun(ctx: KeybindContext): void | Promise<void>;

    async run(ctx: KeybindContext): Promise<void> {
        if (!this.getApplicableLanguages().includes(ctx.requireEditor().getCurrentLanguage()!)) {
            ctx.abort();
        } else {
            const result = this.doRun(ctx);
            if (result instanceof Promise) {
                await result;
            }
        }
    }
}
