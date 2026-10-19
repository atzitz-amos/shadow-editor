import {CodeAnalysisPass} from "../../../../lang/codeAnalysis/analysis/api/CodeAnalysisPass";
import {Editor} from "../../../../editor/Editor";
import {SynNodeVisitor} from "../../../../lang/syntax/visitors/SynNodeVisitor";
import {RISCVSynVisitor} from "../../lang/syntax/visitor/RISCVSynVisitor";
import {RISCVProgram} from "../../lang/syntax/RISCVProgram";
import {RISCVControlFlowGraphBuilder} from "../controlFlow/RISCVControlFlowGraphBuilder";

/**
 *
 * @author Atzitz Amos
 * @date 10/7/2026
 * @since 1.0.0
 */
export default class RiscVControlFlowPass implements CodeAnalysisPass<null> {
    collectVisitors(): SynNodeVisitor[] {
        return [new class extends RISCVSynVisitor {
            visitRISCVProgram(node: RISCVProgram): void {
                const builder = new RISCVControlFlowGraphBuilder(node);
                node.setControlGraph(builder.createGraph());
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
