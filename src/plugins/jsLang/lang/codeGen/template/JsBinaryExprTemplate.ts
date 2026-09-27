import {JsSynTemplate} from "./JsSynTemplate";
import {QuickParseUtils} from "../../../../../lang/syntax/utils/QuickParseUtils";
import {JsParser} from "../../parser/JsParser";
import JsLang from "../../JsLang";
import {JsBinaryExpr} from "../../syntax/expr/JsBinaryExpr";
import {JsExprTemplate} from "./JsExprTemplate";
import {JsExpr} from "../../syntax/expr/JsExpr";

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
        return new JsExprTemplate((this.element as JsBinaryExpr).getLeft());
    }

    public getRight(): JsExprTemplate {
        return new JsExprTemplate((this.element as JsBinaryExpr).getRight());
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
