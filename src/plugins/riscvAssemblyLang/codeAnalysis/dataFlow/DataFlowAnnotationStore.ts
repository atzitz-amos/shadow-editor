import {DataFlowAnnotation} from "./DataFlowAnnotation";
import {RISCVControlFlowNode} from "../controlFlow/node/RISCVControlFlowNode";
import {ControlFlowGraph} from "../controlFlow/ControlFlowGraph";

/**
 *
 * @author Atzitz Amos
 * @date 10/7/2026
 * @since 1.0.0
 */
export class DataFlowAnnotationStore {
    private readonly map: Map<DataFlowAnnotation<any>, any> = new Map();

    constructor(private readonly node: RISCVControlFlowNode) {
    }

    getAnnotation<T>(key: DataFlowAnnotation<T>): T | undefined {
        return this.map.get(key) as T | undefined;
    }

    annotate<T>(graph: ControlFlowGraph, key: DataFlowAnnotation<T>, value: T): void {
        this.map.set(key, value);

        const seen = new Set<RISCVControlFlowNode>;
        const stack: RISCVControlFlowNode[] = graph.resolveAllOutNodes(this.node);
        while (stack.length > 0) {
            const currentNode = stack.pop()!;
            if (seen.has(currentNode)) {
                continue;
            }
            seen.add(currentNode);

            const store = currentNode.getDataFlowStore();
            const existing = store.getAnnotation(key);
            const merged = key.merge(currentNode, value, existing);
            if (merged) {
                store.map.set(key, merged);
            }

            stack.push(...graph.resolveAllOutNodes(currentNode));
        }
    }

    has(key: DataFlowAnnotation<any>): boolean {
        return this.map.has(key);
    }
}
