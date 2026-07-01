import {SynCodeBlock} from "../../../../core/lang/syntax/api/SynCodeBlock";
import {ASTNode} from "../../../../core/lang/syntax/builder/parser/nodes/ASTNode";
import {SynNode} from "../../../../core/lang/syntax/api/SynNode";
import {SynTokenNode} from "../../../../core/lang/syntax/impl/SynTokenNode";
import {SynNodeVisitor} from "../../../../core/lang/syntax/utils/visitors/SynNodeVisitor";
import {JsSynVisitor} from "./visitors/JsSynVisitor";

/**
 *
 * @author Atzitz Amos
 * @date 11/23/2025
 * @since 1.0.0
 */
export class JsCodeBlock extends SynCodeBlock {
    private readonly statements: SynNode[] = [];

    constructor(node: ASTNode) {
        super(node);

        for (let child of this.getChildren()) {
            if (!(child instanceof SynTokenNode))
                this.statements.push(child);
        }
    }

    getStatements(): SynNode[] {
        return this.statements;
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitCodeBlock(this);
        }

        super.accept(visitor);
    }
}
