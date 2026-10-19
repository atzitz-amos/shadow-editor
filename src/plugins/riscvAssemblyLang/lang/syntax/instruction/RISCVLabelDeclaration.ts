import {SynASTElementImpl} from "../../../../../lang/syntax/impl/tree/SynASTElementImpl";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {RISCVSynVisitor} from "../visitor/RISCVSynVisitor";
import {SynNamedElement} from "../../../../../lang/syntax/impl/reference/SynNamedElement";
import {RISCVProgram} from "../RISCVProgram";
import {SynNode} from "../../../../../lang/syntax/api/SynNode";

/**
 *
 * @author Atzitz Amos
 * @date 10/7/2026
 * @since 1.0.0
 */
export class RISCVLabelDeclaration extends SynASTElementImpl implements SynNamedElement {
    getName(): string {
        return this.getText().split(":")[0].trim();
    }

    accept(visitor: SynNodeVisitor): void {
        if (visitor instanceof RISCVSynVisitor) visitor.visitLabelDeclaration(this);
        visitor.visitNamedElement(this);
        super.accept(visitor);
    }

    isProcedureLabel(): boolean {
        return this.getEnclosingOfType(RISCVProgram)?.isProcedure(this.getName()) || false;
    }

    getParentProcedure(): RISCVLabelDeclaration | null {
        let result: SynNode | null = this;
        while (result && (!(result instanceof RISCVLabelDeclaration) || !result.isProcedureLabel())) {
            result = result.previousSibling()
        }
        return result;
    }
}
