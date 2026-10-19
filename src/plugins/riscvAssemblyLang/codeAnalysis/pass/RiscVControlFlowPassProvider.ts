import {Editor} from "../../../../editor/Editor";
import {CodeAnalysisPass} from "../../../../lang/codeAnalysis/analysis/api/CodeAnalysisPass";
import {CodeAnalysisPassProvider} from "../../../../lang/codeAnalysis/analysis/api/CodeAnalysisPassProvider";
import {SynDocument} from "../../../../lang/syntax/api/document/SynDocument";
import RiscVControlFlowPass from "./RiscVControlFlowPass";

/**
 *
 * @author Atzitz Amos
 * @date 10/7/2026
 * @since 1.0.0
 */
export default class RiscVControlFlowPassProvider extends CodeAnalysisPassProvider<null> {
    createPass(editor: Editor, document: SynDocument): CodeAnalysisPass<null> {
        return new RiscVControlFlowPass();
    }

    getPriority(): number {
        return 0;
    }
}
