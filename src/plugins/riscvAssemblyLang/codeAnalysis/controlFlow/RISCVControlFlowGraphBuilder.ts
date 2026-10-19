import {RISCVProgram} from "../../lang/syntax/RISCVProgram";
import {ControlFlowGraph} from "./ControlFlowGraph";
import {SynChildrenIterator} from "../../../../lang/syntax/visitors/SynChildrenIterator";
import {RISCVInstruction} from "../../lang/syntax/instruction/RISCVInstruction";
import {RISCVLabelDeclaration} from "../../lang/syntax/instruction/RISCVLabelDeclaration";
import {RISCVJalInstruction} from "../../lang/syntax/instruction/RISCVJalInstruction";
import {RISCVJumpInstruction} from "../../lang/syntax/instruction/RISCVJumpInstruction";
import {RISCVBranchInstruction} from "../../lang/syntax/instruction/RISCVBranchInstruction";
import {RISCVBranchZInstruction} from "../../lang/syntax/instruction/RISCVBranchZInstruction";
import {RISCVControlFlowNode} from "./node/RISCVControlFlowNode";
import {RISCVControlFlowBlockNode} from "./node/RISCVControlFlowBlockNode";
import {RISCVControlFlowLabelledBlockNode} from "./node/RISCVControlFlowLabelledBlockNode";
import {RISCVControlFlowJalNode} from "./node/RISCVControlFlowJalNode";
import {RISCVControlFlowBranchNode} from "./node/RISCVControlFlowBranchNode";
import {RISCVControlFlowRetNode} from "./node/RISCVControlFlowRetNode";
import {RISCVRetInstruction} from "../../lang/syntax/instruction/RISCVRetInstruction";
import {SynASTElement} from "../../../../lang/syntax/api/tree/SynASTElement";

/**
 *
 * @author Atzitz Amos
 * @date 10/7/2026
 * @since 1.0.0
 */
export class RISCVControlFlowGraphBuilder {
    private readonly iterator: SynChildrenIterator;

    private prevNode: RISCVControlFlowNode | undefined = undefined;

    /**
     * Whether execution can flow from {@link prevNode} into the next node that gets built.
     * False right after an unconditional jump (and any other instruction that ends the flow).
     */
    private fallsThrough: boolean = true;

    private nodeBuilder: undefined | ((block: SynASTElement[]) => RISCVControlFlowNode) = undefined;
    private readonly currentBlock: SynASTElement[] = [];

    private graph: ControlFlowGraph = new ControlFlowGraph();

    constructor(private readonly program: RISCVProgram) {
        this.iterator = new SynChildrenIterator(program);
    }

    public createGraph(): ControlFlowGraph {
        this.createGraphRecursive();
        this.splitHere();
        return this.graph;
    }

    private createGraphRecursive() {
        while (this.iterator.hasNextSibling()) {
            const node = this.iterator.nextSibling();
            if (node instanceof RISCVInstruction) {
                this.handleInstruction(node);
            } else if (node instanceof RISCVLabelDeclaration) {
                this.handleLabel(node);
            }
        }
    }

    private handleLabel(label: RISCVLabelDeclaration) {
        // Flush the pending block first, so the tail of the previous procedure still gets linked to its predecessor
        this.splitHere(block => new RISCVControlFlowLabelledBlockNode(label, block));

        // A new procedure never receives a fallthrough edge from whatever came before it
        if (label.isProcedureLabel()) this.prevNode = undefined;

        this.iterator.enter();
        this.createGraphRecursive();
        this.iterator.exit();
        this.splitHere();
    }

    private handleInstruction(instruction: RISCVInstruction) {
        if (instruction instanceof RISCVJalInstruction) {
            // A call: the next node is the return point, so flow continues
            this.splitHere(_ => new RISCVControlFlowJalNode(instruction));
            this.splitHere();
        } else if (instruction instanceof RISCVBranchInstruction || instruction instanceof RISCVBranchZInstruction) {
            // Conditional branch: fallthrough = not taken
            this.splitHere(_ => new RISCVControlFlowBranchNode(instruction));
            this.splitHere();
        } else if (instruction instanceof RISCVJumpInstruction) {
            // Unconditional jump: nothing after it is reachable by falling through
            this.splitHere(_ => new RISCVControlFlowBranchNode(instruction));
            this.splitHere();
            this.fallsThrough = false;
        } else if (instruction instanceof RISCVRetInstruction) {
            // Return: leaves the procedure, nothing falls through
            this.splitHere(_ => new RISCVControlFlowRetNode(instruction));
            this.splitHere();
            this.fallsThrough = false;
        } else {
            this.currentBlock.push(instruction);
        }
    }

    private buildBlock(): RISCVControlFlowNode | undefined {
        // Plain block with no instructions: nothing to build
        if (!this.nodeBuilder && this.currentBlock.length === 0) {
            return undefined;
        }

        const block = [...this.currentBlock];
        if (this.nodeBuilder) {
            const built = this.nodeBuilder(block);
            if (built instanceof RISCVControlFlowLabelledBlockNode) {
                this.graph.addLabelledNode(built);
            }
            return built;
        }
        return new RISCVControlFlowBlockNode(block);
    }

    private splitHere(builder?: (block: SynASTElement[]) => RISCVControlFlowNode) {
        const blockNode = this.buildBlock();
        if (blockNode) {
            if (this.prevNode && this.fallsThrough) {
                this.graph.addEdge(this.prevNode, blockNode);
            }
            this.prevNode = blockNode;
            this.fallsThrough = true;
        }
        this.currentBlock.length = 0;

        this.nodeBuilder = builder;
    }
}