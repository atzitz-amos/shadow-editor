import {RiscVDirective} from "./RiscVDirective";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {RISCVSynVisitor} from "../visitor/RISCVSynVisitor";
import {SynNamedElement} from "../../../../../lang/syntax/impl/reference/SynNamedElement";

/**
 *
 * @author Atzitz Amos
 * @date 10/7/2026
 * @since 1.0.0
 */
export class RISCVEquDirective extends RiscVDirective implements SynNamedElement {
    getName(): string {
        return this.getIdentifiers()[0]?.getValue()!;
    }

    getValue(): string | null {
        return this.getNumberLiterals()[0]?.getValue() ?? null;
    }

    accept(visitor: SynNodeVisitor): void {
        if (visitor instanceof RISCVSynVisitor) visitor.visitEquDirective(this);
        visitor.visitNamedElement(this);
        super.accept(visitor);
    }
}
