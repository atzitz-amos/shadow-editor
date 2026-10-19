import {QuickParseUtils} from "../../../../../../lang/syntax/utils/QuickParseUtils";
import JsLang from "../../../JsLang";
import {JsParser} from "../../../parser/JsParser";
import {JsExprTemplate} from "./JsExprTemplate";
import {JsAssignmentExpr} from "../../../syntax/expr/JsAssignmentExpr";

/**
 *
 * @author Atzitz Amos
 * @date 9/29/2026
 * @since 1.0.0
 */
export class JsAssignmentExprTemplate extends JsExprTemplate {
    public static fromString(expr: string): JsAssignmentExprTemplate {
        const parsed = QuickParseUtils.quickParseElementFactory<JsParser>(JsLang.INSTANCE, expr, parser => {
            parser.getExprParser().parseExpression();
        });
        if (!(parsed instanceof JsAssignmentExpr)) {
            throw new Error(`Failed to parse assignment expr from string: ${expr}`);
        }
        return new JsAssignmentExprTemplate(parsed);
    }

    public getLeft(): JsExprTemplate {
        const left = new JsExprTemplate((this.element as JsAssignmentExpr).getLeft());
        left.addObserver(this);
        return left;
    }

    public getRight(): JsExprTemplate {
        const right = new JsExprTemplate((this.element as JsAssignmentExpr).getRight());
        right.addObserver(this);
        return right;
    }

    public setLeft(template: JsExprTemplate) {
        const range = this.toRelativeRange((this.element as JsAssignmentExpr).getLeft().getTextRange());
        this.modify(range, "");
        this.insertTemplate(range.start, template);
    }

    public setRight(template: JsExprTemplate) {
        const range = this.toRelativeRange((this.element as JsAssignmentExpr).getRight().getTextRange());
        this.modify(range, "");
        this.insertTemplate(range.start, template);
    }
}
