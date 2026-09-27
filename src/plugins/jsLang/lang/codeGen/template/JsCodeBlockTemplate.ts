import {JsSynTemplate} from "./JsSynTemplate";
import {QuickParseUtils} from "../../../../../lang/syntax/utils/QuickParseUtils";
import JsLang from "../../JsLang";
import {JsParser} from "../../parser/JsParser";
import {JsCodeBlock} from "../../syntax/JsCodeBlock";
import {JsStatement} from "../../syntax/statements/JsStatement";
import {JsStatementTemplate} from "./JsStatementTemplate";
import {TextRange} from "../../../../../editor/core/coordinate/range/TextRange";
import {IndentUtils} from "../../../../../lang/syntax/utils/IndentUtils";

/**
 *
 * @author Atzitz Amos
 * @date 9/25/2026
 * @since 1.0.0
 */
export class JsCodeBlockTemplate extends JsSynTemplate {
    public static fromString(codeblock: string, expectBrace?: boolean, isFunction?: boolean, isAsync?: boolean, isGenerator?: boolean) {
        const parsed = QuickParseUtils.quickParseElementFactory<JsParser>(JsLang.INSTANCE, codeblock, parser => {
            parser.parseBlock(expectBrace, isFunction, isAsync, isGenerator)
        });
        if (!(parsed instanceof JsCodeBlock)) {
            throw new Error("Parsed element is not a JsCodeBlockTemplate");
        }
        return new JsCodeBlockTemplate(parsed);
    }

    public insertStatementBefore(statement: JsStatement, template: JsStatementTemplate, indent: string="") {
        const offset = this.toRelativeOffset(statement.getTextRange().start);
        this.insertTemplate(offset, template);
        this.modify(new TextRange(offset, offset), "\n" + indent);
    }
}
