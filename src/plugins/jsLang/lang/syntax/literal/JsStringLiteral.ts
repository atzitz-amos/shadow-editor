import {JsLiteral} from "./JsLiteral";
import {SynNodeVisitor} from "../../../../../core/lang/syntax/utils/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";
import {TextRange} from "../../../../../editor/core/coordinate/range/TextRange";

/**
 *
 * @author Atzitz Amos
 * @date 6/1/2026
 * @since 1.0.0
 */
export class JsStringLiteral extends JsLiteral {
    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitStringLiteral(this);
            "        ";
        } else {
            super.accept(visitor);
        }
    }

    getRangeWithoutQuotes(): TextRange {
        const range = this.getTextRange();
        return new TextRange(range.start + 1, this.isUnterminated() ? range.end : range.end - 1);
    }

    getQuote(): string {
        return this.getValue().slice(0, 1);
    }

    getStringValue(): string {
        const text = this.getValue().slice(1);
        return this.isUnterminated() ? text : text.slice(0, -1);
    }

    isUnterminated(): boolean {
        const value = this.getValue();
        if (value.length < 2) {
            return true;
        }
        const quote = value[0];
        return value[value.length - 1] !== quote;
    }
}
