import {SynNodeVisitor} from "../../../syntax/visitors/SynNodeVisitor";
import {LanguageBase} from "../../../LanguageBase";

/**
 *
 * @author Atzitz Amos
 * @date 8/28/2026
 * @since 1.0.0
 */
export abstract class ReferenceContributor {
    abstract buildVisitor(holder): SynNodeVisitor;

    abstract getId(): string;

    abstract getApplicableLanguages(): LanguageBase[];
}
