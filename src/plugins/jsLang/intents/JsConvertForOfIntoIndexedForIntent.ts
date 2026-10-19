import {Caret} from "../../../editor/core/caret/Caret";
import {IntentBase} from "../../../lang/codeAnalysis/intents/IntentBase";
import {SynModTree} from "../../../lang/codeGen/modification/SynModTree";
import {LanguageBase} from "../../../lang/LanguageBase";
import {SynNode} from "../../../lang/syntax/api/SynNode";
import JsLang from "../lang/JsLang";
import {JsForOfStatement} from "../lang/syntax/statements/JsForOfStatement";
import {JsVariableDeclaration} from "../lang/syntax/statements/JsVariableDeclaration";
import {JsIdentifier} from "../lang/syntax/literal/JsIdentifier";
import {JsLexicalGrammar} from "../lang/lexer/JsLexicalGrammar";
import {TextRange} from "../../../editor/core/coordinate/range/TextRange";
import {JsStatementTemplate} from "../lang/codeGen/template/JsStatementTemplate";
import {JsDeclarator} from "../lang/syntax/statements/JsDeclarator";
import {JsCodeBlockTemplate} from "../lang/codeGen/template/JsCodeBlockTemplate";
import {IndentUtils} from "../../../lang/syntax/utils/IndentUtils";

/**
 *
 * @author Atzitz Amos
 * @date 9/28/2026
 * @since 1.0.0
 */
export default class JsConvertForOfIntoIndexedForIntent extends IntentBase {
    getDescription(): string {
        return "Convert 'for-of' loop into indexed loop";
    }

    getApplicableLanguage(): LanguageBase[] {
        return [JsLang.INSTANCE];
    }

    getTargetTypes(): Class<SynNode>[] {
        return [JsForOfStatement];
    }

    getId(): string {
        return "js.intent.convertForOfIntoIndexedFor";
    }

    isApplicable(caret: Caret, node: JsForOfStatement): boolean {
        const declaration = node.getDeclarator();
        let name: string;
        if (!(declaration instanceof JsVariableDeclaration) || declaration.getDeclarations().length !== 1) return false;

        return node.getExpr() instanceof JsIdentifier;
    }

    async execute(caret: Caret, node: JsForOfStatement, synModTree: SynModTree): Promise<void> {
        const declaration = node.getDeclarator();
        const name: JsDeclarator = (declaration as JsVariableDeclaration).getDeclarations()[0];

        const array = (node.getExpr() as JsIdentifier).getName();
        const template = new JsStatementTemplate(node);
        template.modify(template.toRelativeRange(this.getParenthesisRange(node)), `let i = 0; i < ${array}.length; i++`);

        const body = new JsCodeBlockTemplate(node.getBody());
        body.addObserver(template);

        const indent = IndentUtils.getIndentationForSynNode(node) + IndentUtils.getLanguageSpecificIndentationSize(JsLang.INSTANCE);

        body.insertStatementAtStart(JsStatementTemplate.fromString(`let ${name.getName()} = ${array}[i];`), IndentUtils.makeIndentString(indent));

        synModTree.replaceNode(node, template);
    }

    private getParenthesisRange(loop: JsForOfStatement) {
        const openParen = loop.getAllTokensOfType(JsLexicalGrammar.LPAREN)[0];
        const closeParen = loop.getAllTokensOfType(JsLexicalGrammar.RPAREN)[0];
        return new TextRange(openParen.getTextRange().start + 1, closeParen.getTextRange().end - 1);
    }

}
