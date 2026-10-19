import {JsLiteral} from "./JsLiteral";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";

export enum NumberFormat {
    DECIMAL = "decimal",
    HEXADECIMAL = "hexadecimal",
    BINARY = "binary",
    OCTAL = "octal"
}

/**
 *
 * @author Atzitz Amos
 * @date 12/11/2025
 * @since 1.0.0
 */
export class JsNumberLiteral extends JsLiteral {
    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitNumberLiteral(this);
        }

        super.accept(visitor);
    }

    getTrimmedValue(): string {
        return this.getText().replace(/_/g, "");
    }

    getNumericValue(): number {
        switch (this.getNumberFormat()) {
            case NumberFormat.DECIMAL:
                return parseFloat(this.getTrimmedValue());
            case NumberFormat.HEXADECIMAL:
                return parseInt(this.getTrimmedValue().substring(2), 16);
            case NumberFormat.BINARY:
                return parseInt(this.getTrimmedValue().substring(2), 2);
            case NumberFormat.OCTAL:
                return parseInt(this.getTrimmedValue().substring(2), 8);
            default:
                throw new Error(`Unknown number format: ${this.getNumberFormat()}`);
        }
    }

    getNumberFormat(): NumberFormat {
        if (this.getTrimmedValue().startsWith("0x") || this.getTrimmedValue().startsWith("0X")) {
            return NumberFormat.HEXADECIMAL;
        } else if (this.getTrimmedValue().startsWith("0b") || this.getTrimmedValue().startsWith("0B")) {
            return NumberFormat.BINARY;
        } else if (this.getTrimmedValue().startsWith("0o") || this.getTrimmedValue().startsWith("0O")) {
            return NumberFormat.OCTAL;
        } else {
            return NumberFormat.DECIMAL;
        }
    }
}
