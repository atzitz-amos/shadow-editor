import {LanguageBase} from "../../LanguageBase";
import {SynNode} from "../../syntax/api/SynNode";

/**
 *
 * @author Atzitz Amos
 * @date 8/30/2026
 * @since 1.0.0
 */
export abstract class IntentBase {
    abstract getDescription(): string;

    abstract getApplicableLanguage(): LanguageBase[];

    abstract getTargetTypes(): Class<SynNode>[];

    abstract getId(): string;

    abstract isApplicable(node: SynNode): boolean;

    abstract execute(node: SynNode): void;
}
