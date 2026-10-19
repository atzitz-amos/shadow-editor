import {InspectionBase} from "../../../lang/codeAnalysis/inspections/Inspection";
import {InspectionSeverity} from "../../../lang/codeAnalysis/inspections/InspectionSeverity";
import {ProblemsHolder} from "../../../lang/codeAnalysis/inspections/problems/ProblemsHolder";
import {LanguageBase} from "../../../lang/LanguageBase";
import {SynNodeVisitor} from "../../../lang/syntax/visitors/SynNodeVisitor";
import RiscV32Lang from "../lang/RiscvLang";
import {RISCVSynVisitor} from "../lang/syntax/visitor/RISCVSynVisitor";
import {RISCVProgram} from "../lang/syntax/RISCVProgram";
import {RISCVControlFlowLabelledBlockNode} from "../codeAnalysis/controlFlow/node/RISCVControlFlowLabelledBlockNode";
import {ControlFlowGraph} from "../codeAnalysis/controlFlow/ControlFlowGraph";
import {RISCVControlFlowRetNode} from "../codeAnalysis/controlFlow/node/RISCVControlFlowRetNode";
import {TextRange} from "../../../editor/core/coordinate/range/TextRange";
import {RISCVControlFlowNode} from "../codeAnalysis/controlFlow/node/RISCVControlFlowNode";

/**
 *
 * @author Atzitz Amos
 * @date 10/7/2026
 * @since 1.0.0
 */
export default class RISCVControlFlowInspection extends InspectionBase {

    getId(): string {
        return "riscv-assembly.inspections.controlFlow"
    }

    getSeverity(): InspectionSeverity {
        return InspectionSeverity.WARNING;
    }

    getApplicableLanguages(): LanguageBase[] {
        return [RiscV32Lang.INSTANCE];
    }

    buildVisitor(holder: ProblemsHolder): SynNodeVisitor {
        const inspection = this;
        return new class extends RISCVSynVisitor {
            visitRISCVProgram(node: RISCVProgram) {
                const graph = node.getControlGraph();
                if (!graph) return;
                console.log(graph.toMermaid())
                for (const procedure of node.getProcedureNames()) {
                    this.visitProcedure(graph, graph.getLabelledNode(procedure));
                }
            }

            private visitProcedure(graph: ControlFlowGraph, labelledNode: RISCVControlFlowLabelledBlockNode | undefined) {
                if (!labelledNode) return;
                const visited = new Set<RISCVControlFlowNode>();
                const stack: RISCVControlFlowNode[] = [labelledNode];

                while (stack.length > 0) {
                    const current = stack.pop()!;

                    if (visited.has(current)) {
                        continue;
                    }
                    visited.add(current);
                    const out = graph.resolveAllOutNodes(current);
                    if (out.length === 0) {
                        if (current instanceof RISCVControlFlowRetNode) {

                        } else {
                            const begin = labelledNode.getLabel().getTextRange().start;
                            holder.registerProblem(
                                inspection,
                                `Procedure '${labelledNode.getName()}' does not have a return statement.`,
                                labelledNode.getLabel(),
                                [],
                                new TextRange(begin, begin + labelledNode.getLabel().getName().length + 1)
                            );
                        }
                    }

                    stack.push(...out)
                }
            }
        }
    }
}
