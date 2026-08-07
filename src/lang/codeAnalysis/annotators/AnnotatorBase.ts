import {HighlightHolder} from "../../../editor/ui/highlighter/HighlightHolder";
import {SynNodeVisitor} from "../../syntax/visitors/SynNodeVisitor";
import {LanguageBase} from "../../LanguageBase";

/**
 * An annotator interface for language-specific annotations.
 * This will run in the background to provide real-time feedback to the user as they code.
 *
 * @author Atzitz Amos
 * @date 11/12/2025
 * @since 1.0.0
 */
export abstract class AnnotatorBase {
    abstract buildVisitor(holder: HighlightHolder): SynNodeVisitor;

    abstract getId(): string;

    abstract getApplicableLanguages(): LanguageBase[];
}
