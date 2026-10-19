import {RISCVControlFlowLabelledBlockNode} from "./node/RISCVControlFlowLabelledBlockNode";
import {DefaultRegistry} from "../../../../editor/utils/collection/DefaultRegistry";
import {RISCVControlFlowNode} from "./node/RISCVControlFlowNode";
import {RISCVControlFlowBranchNode} from "./node/RISCVControlFlowBranchNode";
import {RISCVControlFlowBlockNode} from "./node/RISCVControlFlowBlockNode";
import {RISCVControlFlowJalNode} from "./node/RISCVControlFlowJalNode";
import {RISCVControlFlowRetNode} from "./node/RISCVControlFlowRetNode";

/**
 *
 * @author Atzitz Amos
 * @date 10/7/2026
 * @since 1.0.0
 */
export class ControlFlowGraph {
    private readonly labelledNodes: Map<string, RISCVControlFlowLabelledBlockNode> = new Map();
    private readonly outNodes: DefaultRegistry<RISCVControlFlowNode, RISCVControlFlowNode | string> = new DefaultRegistry();
    private readonly inNodes: DefaultRegistry<RISCVControlFlowNode | string, RISCVControlFlowNode> = new DefaultRegistry();

    private readonly allNodes: Set<RISCVControlFlowNode> = new Set();

    public addLabelledNode(node: RISCVControlFlowLabelledBlockNode): void {
        this.labelledNodes.set(node.getName(), node);
        this.allNodes.add(node);
    }

    public addEdge(from: RISCVControlFlowNode, to: RISCVControlFlowNode | string): void {
        this.allNodes.add(from);
        if (typeof to !== "string") this.allNodes.add(to);
        this.outNodes.register(from, to);
        this.inNodes.register(to, from);
    }

    public getAllNodes(): RISCVControlFlowNode[] {
        return [...this.allNodes];
    }

    public getOutNodes(node: RISCVControlFlowNode): (RISCVControlFlowNode | string)[] {
        return this.outNodes.getAll(node);
    }

    public getInNodes(node: RISCVControlFlowNode): (RISCVControlFlowNode | string)[] {
        let nodes = this.inNodes.getAll(node);
        if (node instanceof RISCVControlFlowLabelledBlockNode) {
            nodes = nodes.concat(this.inNodes.getAll(node.getName()));
        }
        return nodes;
    }

    public getLabelledNode(label: string): RISCVControlFlowLabelledBlockNode | undefined {
        return this.labelledNodes.get(label);
    }

    public resolveAllOutNodes(node: RISCVControlFlowNode): RISCVControlFlowNode[] {
        const out = this.getOutNodes(node);
        if (node instanceof RISCVControlFlowBranchNode) {
            const target = this.getLabelledNode(node.getTarget());
            if (target) out.push(target);
        }

        return out.map(outNode => {
            if (typeof outNode === 'string') {
                const labelledNode = this.getLabelledNode(outNode);
                if (!labelledNode) {
                    throw new Error(`Label ${outNode} not found in control flow graph.`);
                }
                return labelledNode;
            } else {
                return outNode;
            }
        });
    }

    public toMermaid(): string {
        const ids = new Map<RISCVControlFlowNode, string>();
        const id = (n: RISCVControlFlowNode) => {
            if (!ids.has(n)) ids.set(n, `n${ids.size}`);
            return ids.get(n)!;
        };

        // Mermaid-safe text: entity-escape special chars, newlines become <br/>
        const esc = (s: string) => s
            .replace(/#/g, "#35;")
            .replace(/"/g, "#quot;")
            .replace(/</g, "#lt;")
            .replace(/>/g, "#gt;");
        const lines = (parts: string[]) => parts.map(esc).join("<br/>");

        const render = (n: RISCVControlFlowNode): string => {
            const i = id(n);
            // labelled first, in case it extends RISCVControlFlowBlockNode
            if (n instanceof RISCVControlFlowLabelledBlockNode) {
                const body = n.getNodes().map(t => t.getText());
                return `${i}(["${lines([n.getName() + ":", ...body])}"])`;
            }
            if (n instanceof RISCVControlFlowBlockNode) {
                const body = n.getNodes().map(t => t.getText());
                return `${i}["${body.length ? lines(body) : "(empty)"}"]`;
            }
            if (n instanceof RISCVControlFlowBranchNode) {
                return `${i}{"${lines(["branch", "-> " + String(n.getTarget())])}"}`;
            }
            if (n instanceof RISCVControlFlowJalNode) {
                return `${i}[["${lines(["jal", "-> " + String(n.getTarget())])}"]]`;
            }
            if (n instanceof RISCVControlFlowRetNode) {
                return `${i}(("ret"))`;
            }
            return `${i}["${esc(n.constructor.name)}"]`;
        };

        const out: string[] = ["flowchart TD"];
        const nodes = this.getAllNodes();
        nodes.forEach(n => out.push("  " + render(n)));

        const unresolved = new Set<string>();
        for (const from of nodes) {
            const edges = this.getOutNodes(from);
            const targetsSeen = new Set<RISCVControlFlowNode>();

            for (const to of edges) {
                const target = typeof to === "string" ? this.getLabelledNode(to) : to;
                if (target) {
                    targetsSeen.add(target);
                    out.push(`  ${id(from)} --> ${id(target)}`);
                } else if (typeof to === "string") {
                    unresolved.add(to);
                    out.push(`  ${id(from)} -.-> missing_${to.replace(/\W/g, "_")}`);
                }
            }

            // Branch/jal/jump targets: draw them from getTarget() if the builder didn't add the edge
            if (from instanceof RISCVControlFlowBranchNode
                || from instanceof RISCVControlFlowJalNode) {
                const t = String(from.getTarget());
                const targetNode = this.getLabelledNode(t);
                const lbl = from instanceof RISCVControlFlowBranchNode ? "taken" : "target";
                if (targetNode && !targetsSeen.has(targetNode)) {
                    out.push(`  ${id(from)} -. ${lbl} .-> ${id(targetNode)}`);
                } else if (!targetNode) {
                    unresolved.add(t);
                    out.push(`  ${id(from)} -. ${lbl} .-> missing_${t.replace(/\W/g, "_")}`);
                }
            }
        }

        for (const label of unresolved) {
            out.push(`  missing_${label.replace(/\W/g, "_")}["MISSING: ${esc(label)}"]:::missing`);
        }
        out.push("  classDef missing fill:#fcc,stroke:#c00");
        return out.join("\n");
    }
}
