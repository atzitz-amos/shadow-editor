import {LanguageBase} from "../../../LanguageBase";
import {Document} from "../../../../editor/core/document/Document";
import {TextRange} from "../../../../core/text/range/TextRange";

/**
 *
 * @author Atzitz Amos
 * @date 10/25/2026
 * @since 1.0.0
 */
export abstract class CompletionTriggerHandler {
    public abstract getApplicableLanguages(): LanguageBase[];

    /** Whether completion makes sense at `offset`, e.g. not inside a comment or a string */
    public abstract isCompletionAllowedAt(document: Document, offset: Offset): boolean;

    /**
     * Whether `ch`, a single character, can be part of an identifier. Typing one keeps the session alive, and
     * this must agree with the lexer on what an identifier is.
     */
    public abstract isIdentifier(ch: string): boolean;

    /**
     * Whether typing `ch`, a single character that is not part of an identifier, opens a session right after
     * it (e.g. `.` for member access). None by default.
     */
    public isTriggerCharacter(ch: string): boolean {
        return false;
    }

    /** The part of the identifier at `offset` that is before it: empty if there is no identifier there */
    public abstract findCompletionPrefix(document: Document, offset: Offset): TextRange;

    public abstract canStartCompletionBefore(document: Document, offset: Offset): boolean;
}
