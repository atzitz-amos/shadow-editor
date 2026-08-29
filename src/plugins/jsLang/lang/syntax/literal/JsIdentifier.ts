import {SynSymbol} from "../../../../../lang/syntax/impl/reference/SynSymbol";
import {ASTNode} from "../../../../../lang/syntax/builder/parser/nodes/ASTNode";
import {SynTokenNode} from "../../../../../lang/syntax/impl/SynTokenNode";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";
import {JsExpr} from "../expr/JsExpr";

/**
 *
 * @author Atzitz Amos
 * @date 12/11/2025
 * @since 1.0.0
 */
export class JsIdentifier extends JsExpr implements SynSymbol {
    private readonly name: string;

    constructor(node: ASTNode) {
        super(node);
        this.name = (this.getNthChild(0) as SynTokenNode).getValue();
    }

    getName(): string {
        return this.name;
    }

    public toDebugString(): string {
        return `${this.name}`;
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitIdentifier(this);
        }

        super.accept(visitor);
    }
}
