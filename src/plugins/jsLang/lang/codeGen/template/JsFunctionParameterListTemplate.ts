import {JsSynTemplate} from "./JsSynTemplate";
import {JsFunctionParameter, JsFunctionParameterList} from "../../syntax/statements/JsFunctionParameterList";
import {QuickParseUtils} from "../../../../../lang/syntax/utils/QuickParseUtils";
import JsLang from "../../JsLang";
import {JsParser} from "../../parser/JsParser";
import {JsFunctionParameterTemplate} from "./JsFunctionParameterTemplate";
import {SynASTElement} from "../../../../../lang/syntax/api/tree/SynASTElement";
import {TextRange} from "../../../../../editor/core/coordinate/range/TextRange";
import {SynTokenNode} from "../../../../../lang/syntax/impl/SynTokenNode";
import {JsLexicalGrammar} from "../../lexer/JsLexicalGrammar";
import {JsFunctionTemplate} from "./JsFunctionTemplate";

/**
 *
 * @author Atzitz Amos
 * @date 9/24/2026
 * @since 1.0.0
 */

// TODO: Template should probably just build a list of "slots" and rebuild the text then from its children
// TODO: The issue is now that if you delete() a parameter and then insert a new one, a comma will be dangling,
// TODO: Because the template didn't remove the parameter from its list

export type JsFunctionParameterPosition = {
    at?: "start" | "end"
    after?: JsFunctionParameter
}

export class JsFunctionParameterListTemplate extends JsSynTemplate {
    constructor(element: SynASTElement) {
        super(element);
    }

    public static fromString(parameters: string): JsFunctionParameterListTemplate {
        const parsed = QuickParseUtils.quickParseElementFactory<JsParser>(JsLang.INSTANCE, parameters, parser => {
            parser.getExprParser().parseFunctionParameterListDeclaration();
        });
        if (!(parsed instanceof JsFunctionParameterList))
            throw new Error(`Failed to parse function parameters from string: ${parameters}`);
        return new JsFunctionParameterListTemplate(parsed);
    }

    public addParameter(parameter: JsFunctionParameterTemplate, position: JsFunctionParameterPosition = {at: "end"}): void {
        if (position.at === "start") {
            const firstParam = (this.element as JsFunctionParameterList).getParameters()[0];
            if (firstParam) {
                const offset = this.toRelativeOffset(firstParam.getTextRange().start);
                this.insertTemplate(offset, parameter);
                this.modify(new TextRange(offset, offset), ", ");
            } else {
                const offset = this.toRelativeOffset((this.element as JsFunctionParameterList).getTextRange().start);
                this.insertTemplate(offset, parameter);
            }
        } else if (position.at === "end") {
            const params = (this.element as JsFunctionParameterList).getParameters();
            if (params.length > 0) {
                const lastParam = params[params.length - 1];
                const offset = this.toRelativeOffset(lastParam.getTextRange().end);
                this.modify(new TextRange(offset, offset), ", ");
                this.insertTemplate(offset, parameter);
            } else {
                const offset = this.toRelativeOffset((this.element as JsFunctionParameterList).getTextRange().start);
                this.insertTemplate(offset, parameter);
            }
        } else if (position.after) {
            const params = (this.element as JsFunctionParameterList).getParameters();
            const index = params.indexOf(position.after);
            if (index !== -1) {
                const afterParam = params[index];
                const offset = this.toRelativeOffset(afterParam.getTextRange().end);
                this.modify(new TextRange(offset, offset), ", ");
                this.insertTemplate(offset + 2, parameter);
            } else {
                throw new Error("The specified parameter to insert after was not found in the parameter list.");
            }
        }
    }

    public removeParameter(element: JsFunctionParameter) {
        let range = element.getTextRange();
        const previousSibling = element.previousSibling();
        const nextSibling = element.nextSibling();
        if (previousSibling instanceof SynTokenNode && previousSibling.getTokenType() === JsLexicalGrammar.COMMA) {
            range = TextRange.enclosing([previousSibling.getTextRange(), range]);
        } else if (nextSibling instanceof SynTokenNode && nextSibling.getTokenType() === JsLexicalGrammar.COMMA) {
            range = TextRange.enclosing([range, nextSibling.getTextRange()]);
        }
        this.modify(this.toRelativeRange(range), "");
    }

    public replaceParameter(index: number, template: JsFunctionParameterTemplate) {
        const range = this.toRelativeRange((this.element as JsFunctionParameterList).getParameters()[index].getTextRange())
        this.modify(range, "");
        this.insertTemplate(range.start, template);
    }

    public getAllParameters(): JsFunctionParameterTemplate[] {
        return (this.element as JsFunctionParameterList).getParameters().map(param => {
            const template = new JsFunctionParameterTemplate(param);
            template.internalSetParameterList(this);
            template.addObserver(this);
            return template;
        });
    }
}