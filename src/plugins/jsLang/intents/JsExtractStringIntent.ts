import {IntentBase} from "../../../lang/codeAnalysis/intents/IntentBase";
import {LanguageBase} from "../../../lang/LanguageBase";
import JsLang from "../lang/JsLang";
import {SynNode} from "../../../lang/syntax/api/SynNode";
import {SynModTree} from "../../../lang/codeGen/modification/SynModTree";
import {JsStringLiteral} from "../lang/syntax/literal/JsStringLiteral";
import {JsCodeBlock} from "../lang/syntax/JsCodeBlock";
import {JsCodeBlockTemplate} from "../lang/codeGen/template/JsCodeBlockTemplate";
import {JsStatement} from "../lang/syntax/statements/JsStatement";
import {JsStatementTemplate} from "../lang/codeGen/template/JsStatementTemplate";
import {IdeDialogUtilsCore} from "../../../core/ui/lib/dialog/utils/IdeDialogUtilsCore";
import {FaIcon} from "../../../core/ui/icons/FaIcon";
import {SynDocumentUtils} from "../../../lang/syntax/utils/SynDocumentUtils";
import {IndentUtils} from "../../../lang/syntax/utils/IndentUtils";
import {Icon} from "../../../core/ui/icons/Icon";
import {Caret} from "../../../editor/core/caret/Caret";

/**
 *
 * @author Atzitz Amos
 * @date 8/31/2026
 * @since 1.0.0
 */
export default class JsExtractStringIntent extends IntentBase {
    isApplicable(caret: Caret, node: JsStringLiteral): boolean {
        return true;
    }

    async execute(caret: Caret, node: JsStringLiteral, synModTree: SynModTree): Promise<void> {
        const codeblock = node.getEnclosingOfType(JsCodeBlock)!;
        const statement = node.getEnclosingOfType(JsStatement)!;
        const template = new JsCodeBlockTemplate(codeblock);

        const name = await IdeDialogUtilsCore.askString("Enter variable name", "Name");
        if (!name) return;

        const indent = SynDocumentUtils.getIndentFor(statement);

        template.insertStatementBefore(
            statement,
            JsStatementTemplate.fromString(`const ${name} = ${node.getText()};`),
            IndentUtils.makeIndentString(indent)
        );
        template.modify(template.toRelativeRange(node.getTextRange()), name);
        synModTree.replaceNode(codeblock, template);
    }

    getDescription(): string {
        return "Introduce variable";
    }

    getApplicableLanguage(): LanguageBase[] {
        return [JsLang.INSTANCE];
    }

    getId(): string {
        return "js.intent.stringIntroduceVariable";
    }

    getIcon(): Icon | null {
        return FaIcon.faTag();
    }

    getTargetTypes(): Class<SynNode>[] {
        return [JsStringLiteral];
    }
}

