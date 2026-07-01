import {Token} from "../syntax/builder/tokens/Token";
import {SynFile} from "../syntax/api/filesystem/SynFile";
import {LanguageBase} from "../LanguageBase";
import {EditorBehaviorContext} from "../../../editor/core/behaviors/context/EditorBehaviorContext";

/**
 *
 * @author Atzitz Amos
 * @date 6/26/2026
 * @since 1.0.0
 */
export abstract class TokenHoverAction {
    abstract getApplicableLanguages(): LanguageBase[];

    abstract isApplicable(ctx: EditorBehaviorContext, token: Token): boolean;

    abstract getDelay(): number;

    abstract execute(ctx: EditorBehaviorContext, file: SynFile | null, token: Token): void;

    abstract cleanup(ctx: EditorBehaviorContext): void;

    requiresShift(token: Token): boolean {
        return false;
    }

    requiresControl(token: Token): boolean {
        return false;
    }

    requiresAlt(token: Token): boolean {
        return false;
    }
}