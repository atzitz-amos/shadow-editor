import {JsSynTemplate} from "./JsSynTemplate";
import {QuickParseUtils} from "../../../../../lang/syntax/utils/QuickParseUtils";
import JsLang from "../../JsLang";
import {JsParser} from "../../parser/JsParser";
import {JsFunctionParameter} from "../../syntax/statements/JsFunctionParameterList";
import {JsExprTemplate} from "./expr/JsExprTemplate";
import {JsFunctionParameterListTemplate} from "./JsFunctionParameterListTemplate";
import {TextRange} from "../../../../../editor/core/coordinate/range/TextRange";
import {JsGrammar} from "../../parser/JsGrammar";

/**
 *
 * @author Atzitz Amos
 * @date 9/25/2026
 * @since 1.0.0
 */
export class JsFunctionParameterTemplate extends JsSynTemplate {
    private parent: JsFunctionParameterListTemplate;

    public static fromString(parameter: string): JsFunctionParameterTemplate {
        const parsed = QuickParseUtils.quickParseElementFactory<JsParser>(JsLang.INSTANCE, parameter, (parser, marker) => {
            parser.getExprParser().parseParameterDeclaration();
            marker.done(JsGrammar.FunctionParameterList);
        });
        if (!(parsed instanceof JsFunctionParameter))
            throw new Error(`Failed to parse function parameter from string: ${parameter}`);
        return new JsFunctionParameterTemplate(parsed);
    }

    public getName(): string {
        return (this.element as JsFunctionParameter).getName();
    }

    public isRest(): boolean {
        return (this.element as JsFunctionParameter).isRest();
    }

    public hasValue(): boolean {
        return (this.element as JsFunctionParameter).hasValue();
    }

    public getValue(): JsExprTemplate | null {
        const value = (this.element as JsFunctionParameter).getValue();
        if (value) {
            const template = new JsExprTemplate(value);
            template.addObserver(this);
            return template;
        }
        return null;
    }

    public setValue(value: JsExprTemplate | null): void {
        const oldVal = (this.element as JsFunctionParameter).getValue()
        if (oldVal) {
            const range = this.toRelativeRange(oldVal.getTextRange());
            this.modify(range, "")
            if (value) this.insertTemplate(range.start, value);
        } else if (value) {
            const offset = this.toRelativeOffset((this.element as JsFunctionParameter).getTextRange().end);
            this.modify(new TextRange(offset, offset), " = ");
            this.insertTemplate(offset, value);
        }
    }

    public internalSetParameterList(parent: JsFunctionParameterListTemplate): void {
        this.parent = parent;
    }

    delete() {
        if (!this.parent) {
            throw new Error("Parent parameter list not set. Cannot delete parameter.");
        }
        this.parent.removeParameter(this.element as JsFunctionParameter);
    }
}

