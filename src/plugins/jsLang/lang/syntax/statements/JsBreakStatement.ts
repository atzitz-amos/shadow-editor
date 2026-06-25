import {ASTNode} from "../../../../../core/lang/syntax/builder/parser/nodes/ASTNode";
import {SynNodeVisitor} from "../../../../../core/lang/syntax/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";
import {SynTokenNode} from "../../../../../core/lang/syntax/impl/SynTokenNode";
import {JsStatement} from "./JsStatement";

/**
 *
 * @author Atzitz Amos
 * @date 6/2/2026
 * @since 1.0.0
 */
export class JsBreakStatement extends JsStatement {
    private readonly label: SynTokenNode | undefined;

    constructor(node: ASTNode) {
        super(node);

        let label = this.getAllToken()[1];
        if (label && label.getValue() != ";") {
            this.label = label;
        }
    }

    getLabel(): SynTokenNode | null {
        return this.label || null;
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitBreakStatement(this);
        } else {
            super.accept(visitor);
        }
    }
}
