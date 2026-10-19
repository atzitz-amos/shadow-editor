import {JsExprTemplate} from "./JsExprTemplate";
import {QuickParseUtils} from "../../../../../../lang/syntax/utils/QuickParseUtils";
import {JsParser} from "../../../parser/JsParser";
import JsLang from "../../../JsLang";
import {JsTernaryExpr} from "../../../syntax/expr/JsTernaryExpr";

/**
 *
 * @author Atzitz Amos
 * @date 9/29/2026
 * @since 1.0.0
 */
export class JsTernaryExprTemplate extends JsExprTemplate {
    public static fromString(expr: string): JsTernaryExprTemplate {
        const parsed = QuickParseUtils.quickParseElementFactory<JsParser>(JsLang.INSTANCE, expr, parser => {
            parser.getExprParser().parseExpression(false);
        });
        if (!(parsed instanceof JsTernaryExpr)) throw new Error("Couldn't parse binary expression from: " + expr);
        return new JsTernaryExprTemplate(parsed);
    }

    public getCondition(): JsExprTemplate {
        const expr = new JsExprTemplate((this.element as JsTernaryExpr).getCondition());
        expr.addObserver(this);
        return expr;
    }

    public getTrueExpr(): JsExprTemplate {
        const expr = new JsExprTemplate((this.element as JsTernaryExpr).getTrueExpr());
        expr.addObserver(this);
        return expr;
    }

    public getFalseExpr(): JsExprTemplate {
        const expr = new JsExprTemplate((this.element as JsTernaryExpr).getFalseExpr());
        expr.addObserver(this);
        return expr;
    }

    public setCondition(template: JsExprTemplate) {
        const range = this.toRelativeRange((this.element as JsTernaryExpr).getCondition().getTextRange());
        this.modify(range, "");
        this.insertTemplate(range.start, template);
    }

    public setTrueExpr(template: JsExprTemplate) {
        const range = this.toRelativeRange((this.element as JsTernaryExpr).getTrueExpr().getTextRange());
        this.modify(range, "");
        this.insertTemplate(range.start, template);
    }

    public setFalseExpr(template: JsExprTemplate) {
        const range = this.toRelativeRange((this.element as JsTernaryExpr).getFalseExpr().getTextRange());
        this.modify(range, "");
        this.insertTemplate(range.start, template);
    }
}
