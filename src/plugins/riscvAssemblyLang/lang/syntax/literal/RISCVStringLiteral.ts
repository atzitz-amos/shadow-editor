import {SynASTElementImpl} from "../../../../../lang/syntax/impl/tree/SynASTElementImpl";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {RISCVSynVisitor} from "../visitor/RISCVSynVisitor";

/**
 *
 * @author Atzitz Amos
 * @date 10/7/2026
 * @since 1.0.0
 */
export class RISCVStringLiteral extends SynASTElementImpl {
    getValue(): string {
        return this.getText();
    }

    getStringValue(): string {
        const value = this.getValue();
        return value.length >= 2 && value[0] === "\"" && value[value.length - 1] === "\""
            ? value.slice(1, -1)
            : value.slice(1);
    }

    accept(visitor: SynNodeVisitor): void {
        if (visitor instanceof RISCVSynVisitor) visitor.visitStringLiteral(this);
        super.accept(visitor);
    }
}
