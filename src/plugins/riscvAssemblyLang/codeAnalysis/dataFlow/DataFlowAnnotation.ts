import {RISCVControlFlowNode} from "../controlFlow/node/RISCVControlFlowNode";

/**
 *
 * @author Atzitz Amos
 * @date 10/7/2026
 * @since 1.0.0
 */
export abstract class DataFlowAnnotation<T> {
    public constructor(private readonly key: string) {
    }

    abstract merge(source: RISCVControlFlowNode, value: T, other: T | undefined): T | undefined;
}
