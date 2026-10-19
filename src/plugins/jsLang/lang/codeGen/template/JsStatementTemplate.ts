import {QuickParseUtils} from "../../../../../lang/syntax/utils/QuickParseUtils";
import JsLang from "../../JsLang";
import {JsStatement} from "../../syntax/statements/JsStatement";
import {JsSynTemplate} from "./JsSynTemplate";
import {SynASTElement} from "../../../../../lang/syntax/api/tree/SynASTElement";
import {JsParser} from "../../parser/JsParser";

/**
 *
 * @author Atzitz Amos
 * @date 9/24/2026
 * @since 1.0.0
 */
export class JsStatementTemplate extends JsSynTemplate {

    constructor(element: SynASTElement) {
        super(element);
    }

    public static fromString(statement: string): JsStatementTemplate {
        const parsed = QuickParseUtils.quickParseElementFactory<JsParser>(JsLang.INSTANCE, statement, parser => {
            parser.parseStatementOrExpr();
        });
        if (!(parsed instanceof JsStatement)) {
            throw new Error(`Failed to parse statement from string: ${statement}`);
        }
        return new JsStatementTemplate(parsed);
    }
}
