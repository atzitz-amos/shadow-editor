import {JsSynTemplate} from "./JsSynTemplate";
import {QuickParseUtils} from "../../../../../lang/syntax/utils/QuickParseUtils";
import JsLang from "../../JsLang";
import {JsParser} from "../../parser/JsParser";
import {JsArgumentList} from "../../syntax/expr/JsArgumentList";
import {JsExprTemplate} from "./JsExprTemplate";

/**
 *
 * @author Atzitz Amos
 * @date 9/27/2026
 * @since 1.0.0
 */
export class JsArgumentListTemplate extends JsSynTemplate {
    public static fromString(expr: string) {
        const parsed = QuickParseUtils.quickParseElementFactory<JsParser>(JsLang.INSTANCE, expr, parser => {
            parser.getExprParser().getPrattParser().parseFunctionArguments();
        });
        if (!(parsed instanceof JsArgumentList)) {
            throw new Error(`Failed to parse argument list from string: ${expr}`);
        }
        return new JsArgumentListTemplate(parsed as JsArgumentList);
    }

    public getAllArguments(): JsExprTemplate[] {
        return (this.element as JsArgumentList).getArguments().map(arg => {
            const template = new JsExprTemplate(arg)
            template.addObserver(this);
            return template;
        });
    }

    public replaceArgument(index: number, argument: JsExprTemplate) {
        const range = this.toRelativeRange(((this.element as JsArgumentList).getArguments()[index].getTextRange()))
        this.modify(range, argument.getText());
    }
}
