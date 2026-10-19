import {HighlightHolder} from "../../../editor/ui/highlighter/HighlightHolder";
import {AnnotatorBase} from "../../../lang/codeAnalysis/annotators/AnnotatorBase";
import {LanguageBase} from "../../../lang/LanguageBase";
import {SynNodeVisitor} from "../../../lang/syntax/visitors/SynNodeVisitor";
import RiscV32Lang from "../lang/RiscvLang";
import {RISCVSynVisitor} from "../lang/syntax/visitor/RISCVSynVisitor";
import {RISCVLabelReference} from "../lang/syntax/literal/RISCVLabelReference";
import {RiscV32Highlighter} from "../lang/highlighter/RiscV32Highlighter";

/**
 *
 * @author Atzitz Amos
 * @date 10/7/2026
 * @since 1.0.0
 */
export default class RiscVLabelAnnotator extends AnnotatorBase {
    buildVisitor(holder: HighlightHolder): SynNodeVisitor {
        return new class extends RISCVSynVisitor {
            visitLabelReference(node: RISCVLabelReference) {
                holder.highlightRange(node.getTextRange(), RiscV32Highlighter.TEXT_LABEL_REF_KEY)
            }
        }
    }

    getId(): string {
        return "riscv-assembly.annotator.labelAnnotator"
    }

    getApplicableLanguages(): LanguageBase[] {
        return [RiscV32Lang.INSTANCE]
    }

}
