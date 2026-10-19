import {Caret} from "../../../editor/core/caret/Caret";
import {IntentBase} from "../../../lang/codeAnalysis/intents/IntentBase";
import {SynModTree} from "../../../lang/codeGen/modification/SynModTree";
import {LanguageBase} from "../../../lang/LanguageBase";
import {SynNode} from "../../../lang/syntax/api/SynNode";
import JsLang from "../lang/JsLang";
import {JsForIStatement} from "../lang/syntax/statements/JsForIStatement";
import {JsIdentifier} from "../lang/syntax/literal/JsIdentifier";
import {JsIdentifierUsageInScopeSearch} from "../lang/codeGen/search/JsIdentifierUsageInScopeSearch";
import {JsNumberLiteral} from "../lang/syntax/literal/JsNumberLiteral";
import {JsBinaryExpr} from "../lang/syntax/expr/JsBinaryExpr";
import {JsMemberAccessExpr} from "../lang/syntax/expr/JsMemberAccessExpr";
import {JsArrayAccessExpr} from "../lang/syntax/expr/JsArrayAccessExpr";
import {JsVariableDeclaration} from "../lang/syntax/statements/JsVariableDeclaration";
import {JsStatementTemplate} from "../lang/codeGen/template/JsStatementTemplate";
import {TextRange} from "../../../editor/core/coordinate/range/TextRange";
import {JsLexicalGrammar} from "../lang/lexer/JsLexicalGrammar";
import {JsPostfixOp} from "../lang/syntax/expr/JsPostfixOp";
import {JsPrefixOp} from "../lang/syntax/expr/JsPrefixOp";

/**
 *
 * @author Atzitz Amos
 * @date 9/28/2026
 * @since 1.0.0
 */
export default class JsConvertIndexedForIntoForOfIntent extends IntentBase {

    getDescription(): string {
        return "Convert indexed loop into 'for-of' loop";
    }

    getApplicableLanguage(): LanguageBase[] {
        return [JsLang.INSTANCE]
    }

    getTargetTypes(): Class<SynNode>[] {
        return [JsForIStatement];
    }

    getId(): string {
        return "js.intent.convertIndexedForIntoForOf"
    }

    isApplicable(caret: Caret, node: JsForIStatement): boolean {
        // Check if the caret is within the header of the for statement
        const offset = caret.getOffset();
        if (node.getBody().getTextRange().start < offset) return false;

        const declarations = node.getDeclarator()!;
        if (declarations instanceof JsIdentifier || declarations.getDeclarations().length !== 1) return false;
        const decl = declarations.getDeclarations()[0]!;
        if (!(decl.getValue() instanceof JsNumberLiteral) && (decl.getValue() as JsNumberLiteral).getValue() === "0") return false;

        const cond = node.getCondition();
        if (!(cond instanceof JsBinaryExpr)
            || cond.getOperator().getValue() !== "<"
            || !((cond.getLeft() instanceof JsIdentifier) || (cond.getLeft() as JsIdentifier).getName() === decl.getName())) return false;

        const right = cond.getRight();
        if (!(right instanceof JsMemberAccessExpr)
            || !(right.getObject() instanceof JsIdentifier)
            || right.getProperty().getValue() !== "length") return false;

        const incr = node.getIncrement();
        if (!(incr instanceof JsPostfixOp || incr instanceof JsPrefixOp) || incr.getOp().getValue() !== "++" || !(incr.getOperand() instanceof JsIdentifier) || (incr.getOperand() as JsIdentifier).getName() !== decl.getName()) return false;

        const usages = new JsIdentifierUsageInScopeSearch(node.getBody(), declarations.getDeclarations()[0]).getAllUsages();

        return usages.every(usage => {
            const parent = usage.getParent();
            if (!(parent instanceof JsArrayAccessExpr) || !(parent.getArrayName() instanceof JsIdentifier)) return false;
            if ((parent.getArrayName() as JsIdentifier).getName() !== (right.getObject() as JsIdentifier).getName()) return false;
            return parent.getIndex() === usage;
        });
    }

    async execute(caret: Caret, node: JsForIStatement, synModTree: SynModTree): Promise<void> {
        const decl = (node.getDeclarator() as JsVariableDeclaration).getDeclarations()[0]!;
        const cond = node.getCondition() as JsBinaryExpr;
        const array = ((cond.getRight() as JsMemberAccessExpr).getObject() as JsIdentifier);

        let newName = "element";
        const template = new JsStatementTemplate(node);
        const range = template.toRelativeRange(this.getParenthesisRange(node));

        let doNotModifyFirstInstance = false;

        if (node.getBody().getStatements().length > 0) {
            const firstStatement = node.getBody().getStatements()[0]!;
            if (firstStatement instanceof JsVariableDeclaration && firstStatement.getDeclarations().length === 1) {
                const decl2 = firstStatement.getDeclarations()[0]!;
                if (decl2.getValue() instanceof JsArrayAccessExpr) {
                    const value = decl2.getValue() as JsArrayAccessExpr;
                    if (value.getArrayName() instanceof JsIdentifier
                        && (value.getArrayName() as JsIdentifier).getName() === array.getName()
                        && value.getIndex() instanceof JsIdentifier
                        && (value.getIndex() as JsIdentifier).getName() === decl.getName()) {
                        newName = decl2.getName();
                        template.modify(template.toRelativeRange(firstStatement.getTextRange()), "");
                        doNotModifyFirstInstance = true;
                    }
                }
            }

            template.modify(range, `const ${newName} of ${array.getName()}`);

            new JsIdentifierUsageInScopeSearch(node.getBody(), decl).forEachUsage(usage => {
                if (doNotModifyFirstInstance) doNotModifyFirstInstance = false;
                else template.modify(template.toRelativeRange(usage.getParent()!.getTextRange()), newName);
            });

            synModTree.replaceNode(node, template);
        }
    }

    private getParenthesisRange(loop: JsForIStatement) {
        const openParen = loop.getAllTokensOfType(JsLexicalGrammar.LPAREN)[0];
        const closeParen = loop.getAllTokensOfType(JsLexicalGrammar.RPAREN)[0];
        return new TextRange(openParen.getTextRange().start + 1, closeParen.getTextRange().end - 1);
    }
}
