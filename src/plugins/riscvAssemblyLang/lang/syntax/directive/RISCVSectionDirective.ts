import {RiscVDirective} from "./RiscVDirective";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {RISCVSynVisitor} from "../visitor/RISCVSynVisitor";

/**
 *
 * @author Atzitz Amos
 * @date 10/7/2026
 * @since 1.0.0
 */
export class RISCVSectionDirective extends RiscVDirective {
    getSectionName(): string | null {
        return this.getAllToken()[0]?.getValue() ?? null;
    }

    accept(visitor: SynNodeVisitor): void {
        if (visitor instanceof RISCVSynVisitor) visitor.visitSectionDirective(this);
        super.accept(visitor);
    }
}
