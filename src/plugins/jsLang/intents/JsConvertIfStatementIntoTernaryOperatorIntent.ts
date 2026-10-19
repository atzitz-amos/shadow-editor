import {IntentBase} from "../../../lang/codeAnalysis/intents/IntentBase";
import {Caret} from "../../../editor/core/caret/Caret";
import {SynNode} from "../../../lang/syntax/api/SynNode";
import {SynModTree} from "../../../lang/codeGen/modification/SynModTree";
import {LanguageBase} from "../../../lang/LanguageBase";
import JsLang from "../lang/JsLang";
import {JsIfClause, JsIfStatement} from "../lang/syntax/statements/JsIfStatement";
import {JsExprStatement} from "../lang/syntax/statements/JsExprStatement";
import {JsAssignmentExpr} from "../lang/syntax/expr/JsAssignmentExpr";
import {JsCodeBlock} from "../lang/syntax/JsCodeBlock";
import {JsIdentifier} from "../lang/syntax/literal/JsIdentifier";
import {JsAssignmentExprTemplate} from "../lang/codeGen/template/expr/JsAssignmentExprTemplate";
import {JsExprTemplate} from "../lang/codeGen/template/expr/JsExprTemplate";
import {JsTernaryExprTemplate} from "../lang/codeGen/template/expr/JsTernaryExprTemplate";

/**
 *
 * @author Atzitz Amos
 * @date 9/29/2026
 * @since 1.0.0
 */
export default class JsConvertIfStatementIntoTernaryOperatorIntent extends IntentBase {
    async execute(caret: Caret, node: JsIfStatement, synModTree: SynModTree): Promise<void> {
        const elseStatement = this.extractStatement(node.getElseClause()!.getBody())!;
        const name = (elseStatement.getLeft() as JsIdentifier).getName();
        const clauses = node.getClauses();

        const statement = JsAssignmentExprTemplate.fromString(`${name} = a`);
        const template = this.makeTemplateRecursive(0, clauses, elseStatement)

        statement.setRight(template);
        synModTree.replaceNode(node, statement);

        caret.moveToOffset(node.getTextRange().start);
    }

    getApplicableLanguage(): LanguageBase[] {
        return [JsLang.INSTANCE];
    }

    getDescription(): string {
        return "Replace if with '?:'";
    }

    getId(): string {
        return "js.intent.convertIfStatementIntoTernaryOperator";
    }

    getTargetTypes(): Class<SynNode>[] {
        return [JsIfStatement];
    }

    isApplicable(caret: Caret, node: JsIfStatement): boolean {
        const name = this.validateClauseBody(node.getElseClause()?.getBody());
        if (!name) return false;

        return node.getClauses().length > 0 && node.getClauses().every(clause => {
            return this.validateClauseBody(clause.getBody()) === name;
        });
    }

    private validateClauseBody(body: JsCodeBlock | undefined) {
        const expr = this.extractStatement(body);
        if (!expr) return undefined;
        return expr.getLeft() instanceof JsIdentifier ? (expr.getLeft() as JsIdentifier).getName() : undefined;
    }

    private extractStatement(body: JsCodeBlock | undefined) {
        if (!body) return undefined;
        const statement = body.getStatements()[0];
        if (!(statement instanceof JsExprStatement) || !(statement.getExpr() instanceof JsAssignmentExpr)) return undefined;
        return statement.getExpr() as JsAssignmentExpr;
    }

    private makeTemplateRecursive(index: number, clauses: JsIfClause[], elseClause: JsAssignmentExpr) {
        if (index >= clauses.length) {
            return new JsExprTemplate(elseClause.getRight());
        } else {
            const clause = clauses[index];
            const condition = new JsExprTemplate(clause.getCondition());
            const value = new JsExprTemplate(this.extractStatement(clause.getBody())!.getRight());
            const ternaryTemplate = JsTernaryExprTemplate.fromString(`a ? b : c`);
            ternaryTemplate.setCondition(condition);
            ternaryTemplate.setTrueExpr(value);
            ternaryTemplate.setFalseExpr(this.makeTemplateRecursive(index + 1, clauses, elseClause));
            return ternaryTemplate;
        }
    }
}
