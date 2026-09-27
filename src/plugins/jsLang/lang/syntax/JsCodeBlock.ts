import {SynCodeBlock} from "../../../../lang/syntax/api/SynCodeBlock";
import {ASTNode} from "../../../../lang/syntax/builder/parser/nodes/ASTNode";
import {SynNodeVisitor} from "../../../../lang/syntax/visitors/SynNodeVisitor";
import {JsSynVisitor} from "./visitors/JsSynVisitor";
import {SynScopeType} from "../../../../lang/indexes/scope/SynScopeType";
import {JsSynUtils} from "./utils/JsSynUtils";
import {JsStatement} from "./statements/JsStatement";

/**
 *
 * @author Atzitz Amos
 * @date 11/23/2025
 * @since 1.0.0
 */
export class JsCodeBlock extends SynCodeBlock {
    private readonly statements: JsStatement[];

    constructor(node: ASTNode) {
        super(node);

        this.statements = this.getAllChildrenOfType(JsStatement);
    }

    isImplicit(): boolean {
        return this.getOpeningBrace() === undefined && this.getClosingBrace() === undefined;
    }

    getStatements(): JsStatement[] {
        return this.statements;
    }

    getAssociatedScopeType(): SynScopeType | null {
        const parent = this.getParent();
        if (!parent) return SynScopeType.GLOBAL;
        else if (JsSynUtils.isFunction(parent)) return SynScopeType.FUNCTION;
        else return SynScopeType.BLOCK;
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitJsCodeBlock(this);
        }
        super.accept(visitor);
    }
}
