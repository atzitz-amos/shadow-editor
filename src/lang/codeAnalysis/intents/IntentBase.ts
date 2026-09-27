import {LanguageBase} from "../../LanguageBase";
import {SynNode} from "../../syntax/api/SynNode";
import {SynModTree} from "../../codeGen/modification/SynModTree";
import {Describable} from "../../../core/ui/api/Describable";
import {Icon} from "../../../core/ui/icons/Icon";
import {Caret} from "../../../editor/core/caret/Caret";

/**
 *
 * @author Atzitz Amos
 * @date 8/30/2026
 * @since 1.0.0
 */
export abstract class IntentBase implements Describable {
    abstract getDescription(): string;

    getIcon(): Icon | null {
        return null;
    }

    abstract getApplicableLanguage(): LanguageBase[];

    abstract getTargetTypes(): Class<SynNode>[];

    abstract getId(): string;

    abstract isApplicable(caret: Caret, node: SynNode): boolean;

    abstract execute(caret: Caret, node: SynNode, synModTree: SynModTree): Promise<void>;
}
