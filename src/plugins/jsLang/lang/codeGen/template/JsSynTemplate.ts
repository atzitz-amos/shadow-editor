import {LanguageBase} from "../../../../../lang/LanguageBase";
import JsLang from "../../JsLang";
import {AbstractSynTemplate} from "../../../../../lang/codeGen/template/AbstractSynTemplate";
import {TextRange} from "../../../../../editor/core/coordinate/range/TextRange";

/**
 *
 * @author Atzitz Amos
 * @date 9/24/2026
 * @since 1.0.0
 */
export abstract class JsSynTemplate extends AbstractSynTemplate {
    getLanguage(): LanguageBase {
        return JsLang.INSTANCE;
    }

    delete(): void {
        this.modify(this.toRelativeRange(this.element.getTextRange()), "");
    }

    toRelativeRange(range: TextRange) {
        return range.delta(-this.element.getTextRange().start);
    }

    toRelativeOffset(offset: number) {
        return offset - this.element.getTextRange().start;
    }
}
