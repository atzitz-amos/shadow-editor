import {QuickParseUtils} from "../../../../../../lang/syntax/utils/QuickParseUtils";
import {JsParser} from "../../../parser/JsParser";
import JsLang from "../../../JsLang";
import {JsBinaryExpr} from "../../../syntax/expr/JsBinaryExpr";
import {JsExprTemplate} from "./JsExprTemplate";

/**
 *
 * @author Atzitz Amos
 * @date 9/27/2026
 * @since 1.0.0
 */
export class JsBinaryExprTemplate extends JsExprTemplate {
    public static fromString(expr: string) {
        const parsed = QuickParseUtils.quickParseElementFactory<JsParser>(JsLang.INSTANCE, expr, parser => {
            parser.getExprParser().parseExpression(false);
        });
        if (!(parsed instanceof JsBinaryExpr)) throw new Error("Couldn't parse binary expression from: " + expr);
        return new JsBinaryExprTemplate(parsed);
    }

    public getLeft(): JsExprTemplate {
        const left = new JsExprTemplate((this.element as JsBinaryExpr).getLeft());
        left.addObserver(this);
        return left;
    }

    public getRight(): JsExprTemplate {
        const right = new JsExprTemplate((this.element as JsBinaryExpr).getRight());
        right.addObserver(this);
        return right;
    }

    public setLeft(template: JsExprTemplate) {
        const range = this.toRelativeRange((this.element as JsBinaryExpr).getLeft().getTextRange());
        this.modify(range, "");
        this.insertTemplate(range.start, template);
    }

    public setRight(template: JsExprTemplate) {
        const range = this.toRelativeRange((this.element as JsBinaryExpr).getRight().getTextRange());
        this.modify(range, "");
        this.insertTemplate(range.start, template);
    }
}
