import {SynCodeBlock} from "../../../../lang/syntax/api/SynCodeBlock";
import {ASTNode} from "../../../../lang/syntax/builder/parser/nodes/ASTNode";
import {SynScopeType} from "../../../../lang/indexes/scope/SynScopeType";
import {SynNodeVisitor} from "../../../../lang/syntax/visitors/SynNodeVisitor";
import {RISCVSynVisitor} from "./visitor/RISCVSynVisitor";
import {ControlFlowGraph} from "../../codeAnalysis/controlFlow/ControlFlowGraph";

/**
 *
 * @author Atzitz Amos
 * @date 10/7/2026
 * @since 1.0.0
 */
export class RISCVProgram extends SynCodeBlock {
    private controlGraph: ControlFlowGraph | null = null;
    private readonly procedureNames: Set<string> = new Set<string>();

    constructor(node: ASTNode) {
        super(node);
    }

    getAssociatedScopeType(): SynScopeType | null {
        return SynScopeType.GLOBAL;
    }

    addProcedure(name: string) {
        this.procedureNames.add(name);
    }

    getProcedureNames(): Set<string> {
        return this.procedureNames;
    }

    isProcedure(name: string): boolean {
        return this.procedureNames.has(name);
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof RISCVSynVisitor) visitor.visitRISCVProgram(this);
        super.accept(visitor);
    }

    setControlGraph(cfg: ControlFlowGraph) {
        this.controlGraph = cfg;
    }

    getControlGraph(): ControlFlowGraph | null {
        return this.controlGraph;
    }
}
