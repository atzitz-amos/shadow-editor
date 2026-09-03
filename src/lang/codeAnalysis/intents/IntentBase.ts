import {LanguageBase} from "../../LanguageBase";
import {SynNodeVisitor} from "../../syntax/visitors/SynNodeVisitor";
import {IntentsHolder} from "./holder/IntentsHolder";

/**
 *
 * @author Atzitz Amos
 * @date 8/30/2026
 * @since 1.0.0
 */
export abstract class IntentBase {
    abstract getDescription(): string;

    abstract getApplicableLanguage(): LanguageBase[];

    abstract getId(): string;

    abstract buildVisitor(holder: IntentsHolder): SynNodeVisitor;
}
