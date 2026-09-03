import {SynNodeVisitor} from "../../../syntax/visitors/SynNodeVisitor";
import {LanguageBase} from "../../../LanguageBase";
import {IndexFile} from "../../../indexes/IndexFile";

/**
 *
 * @author Atzitz Amos
 * @date 8/31/2026
 * @since 1.0.0
 */
export abstract class IndexFileContributor {
    abstract buildVisitor(indexFile: IndexFile): SynNodeVisitor;

    abstract getId(): string;

    abstract getApplicableLanguages(): LanguageBase[];
}
