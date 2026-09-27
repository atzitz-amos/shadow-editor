import {QuickParseUtils} from "../../../../../lang/syntax/utils/QuickParseUtils";
import JsLang from "../../JsLang";
import {JsStatement} from "../../syntax/statements/JsStatement";
import {JsSynTemplate} from "./JsSynTemplate";
import {SynASTElement} from "../../../../../lang/syntax/api/tree/SynASTElement";

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
        const parsed = QuickParseUtils.quickParse(JsLang.INSTANCE, statement).tree;
        const parsedStatement = parsed.getToplevelCodeblock().getNthChildOfType(JsStatement, 0);
        if (!parsedStatement) {
            throw new Error(`Failed to parse statement from string: ${statement}`);
        }
        return new JsStatementTemplate(parsedStatement);
    }
}
