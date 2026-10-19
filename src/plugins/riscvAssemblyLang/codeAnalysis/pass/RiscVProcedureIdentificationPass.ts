import {CodeAnalysisPass} from "../../../../lang/codeAnalysis/analysis/api/CodeAnalysisPass";
import {Editor} from "../../../../editor/Editor";
import {SynNodeVisitor} from "../../../../lang/syntax/visitors/SynNodeVisitor";
import {RISCVSynVisitor} from "../../lang/syntax/visitor/RISCVSynVisitor";
import {RISCVProgram} from "../../lang/syntax/RISCVProgram";
import {RISCVJalInstruction} from "../../lang/syntax/instruction/RISCVJalInstruction";
import {RISCVSectionDirective} from "../../lang/syntax/directive/RISCVSectionDirective";

/**
 *
 * @author Atzitz Amos
 * @date 10/7/2026
 * @since 1.0.0
 */
export default class RiscVProcedureIdentificationPass implements CodeAnalysisPass<null> {
    collectVisitors(): SynNodeVisitor[] {
        let program: RISCVProgram;

        return [new class extends RISCVSynVisitor {
            visitRISCVProgram(node: RISCVProgram): void {
                program = node;
            }

            visitJalInstruction(node: RISCVJalInstruction) {
                const targetLabel = node.getTargetLabel();
                if (!targetLabel) return;
                program.addProcedure(targetLabel.getName());
            }

            visitSectionDirective(node: RISCVSectionDirective) {
                if (node.getSectionName() === ".globl" || node.getSectionName() === ".global") {
                    const label = node.getAllToken()[1];
                    if (label) {
                        program.addProcedure(label.getValue());
                    }
                }
            }
        }];
    }

    processResults(editor: Editor): void {
    }

    getHolder(): null {
        return null;
    }

    runOnlyOnVisibleNodes(): boolean {
        return false;
    }
}
