import {JsSynTemplate} from "../JsSynTemplate";
import {QuickParseUtils} from "../../../../../../lang/syntax/utils/QuickParseUtils";
import JsLang from "../../../JsLang";
import {JsParser} from "../../../parser/JsParser";
import {JsExpr} from "../../../syntax/expr/JsExpr";

/**
 *
 * @author Atzitz Amos
 * @date 9/25/2026
 * @since 1.0.0
 */
export class JsExprTemplate extends JsSynTemplate {
    public static fromString(expr: string): JsExprTemplate {
        const parsed = QuickParseUtils.quickParseElementFactory<JsParser>(JsLang.INSTANCE, expr, parser => {
            parser.getExprParser().parseExpression(true);
        });

        if (!(parsed instanceof JsExpr)) {
            throw new Error(`Failed to parse expression from string: ${expr}`);
        }
        return new JsExprTemplate(parsed as JsExpr);
    }
}
