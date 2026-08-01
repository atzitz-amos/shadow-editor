import {ASTRecoveryBuilder} from "../recovery/ASTRecoveryBuilder";

/**
 *
 * @author Atzitz Amos
 * @date 7/30/2026
 * @since 1.0.0
 */
export class IncrementalParserOptimizer {
    private builder: ASTRecoveryBuilder;

    constructor(private readonly target: Constructor, private readonly statefulFields: string[]) {
    }

    begin(cls: any, args: any[]): IncrementalParserOptimizer | null {
        if (!args.length || !(args[0] instanceof ASTRecoveryBuilder)) return null; // Not in recovery mode
        this.builder = args[0];
        return this;
    }
}


