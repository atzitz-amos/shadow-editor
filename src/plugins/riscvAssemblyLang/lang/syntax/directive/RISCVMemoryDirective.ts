import {RiscVDirective} from "./RiscVDirective";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {RISCVSynVisitor} from "../visitor/RISCVSynVisitor";

/**
 *
 * @author Atzitz Amos
 * @date 10/7/2026
 * @since 1.0.0
 */
export class RISCVMemoryDirective extends RiscVDirective {
    getValues(): string[] {
        return [...this.getNumberLiterals(), ...this.getStringLiterals()].map(value => value.getValue());
    }

    accept(visitor: SynNodeVisitor): void {
        if (visitor instanceof RISCVSynVisitor) visitor.visitMemoryDirective(this);
        super.accept(visitor);
    }
}
