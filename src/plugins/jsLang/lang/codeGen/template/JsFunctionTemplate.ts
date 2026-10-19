import {JsSynTemplate} from "./JsSynTemplate";
import {QuickParseUtils} from "../../../../../lang/syntax/utils/QuickParseUtils";
import JsLang from "../../JsLang";
import {JsSynUtils} from "../../syntax/utils/JsSynUtils";
import {JsStatementTemplate} from "./JsStatementTemplate";
import {JsFunction} from "../../syntax/api/JsFunction";
import {SynASTElement} from "../../../../../lang/syntax/api/tree/SynASTElement";
import {SynParentElement} from "../../../../../lang/syntax/api/tree/SynParentElement";
import {JsFunctionParameterListTemplate} from "./JsFunctionParameterListTemplate";

/**
 *
 * @author Atzitz Amos
 * @date 9/24/2026
 * @since 1.0.0
 */
export class JsFunctionTemplate extends JsSynTemplate {

    public static fromString(str: string): JsFunctionTemplate {
        const parsed = QuickParseUtils.quickParse(JsLang.INSTANCE, str).tree.getToplevelCodeblock();
        const parsedFunction = parsed.getElementChildren().find(child => JsSynUtils.isFunction(child));
        if (!parsedFunction) {
            throw new Error(`Failed to parse function from string: ${str}`);
        }
        return new JsFunctionTemplate(parsedFunction);
    }

    public addStatement(statement: JsStatementTemplate, position: "start" | "end" = "end"): void {
        const body = (this.element as JsFunction & SynASTElement).getBody();
        const start = body.getTextRange().start + (body.isImplicit() ? 0 : 1);
        this.insertTemplate(position === "start" ? start : start + body.getTextLength(), statement);
    }

    public findStatement(filter: (el: SynParentElement) => boolean): JsStatementTemplate | null {
        const body = (this.element as JsFunction & SynASTElement).getBody();
        const statement = body.getElementChildren().find(filter);
        if (statement) {
            const template = new JsStatementTemplate(statement);
            template.addObserver(this);
            return template;
        }
        return null;
    }

    getParameters(): JsFunctionParameterListTemplate {
        const params = (this.element as JsFunction & SynASTElement).getParameters();
        if (!params) {
            throw new Error("Function parameters not found.");
        }
        const template = new JsFunctionParameterListTemplate(params);
        template.addObserver(this);
        return template;
    }
}
