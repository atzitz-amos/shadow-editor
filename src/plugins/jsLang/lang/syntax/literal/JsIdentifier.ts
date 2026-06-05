import {SynSymbol} from "../../../../../core/lang/syntax/api/SynSymbol";
import {ASTNode} from "../../../../../core/lang/syntax/builder/parser/nodes/ASTNode";
import {SynTokenNode} from "../../../../../core/lang/syntax/impl/SynTokenNode";
import {SynDeclaration} from "../../../../../core/lang/syntax/impl/SynDeclaration";
import {SynNodeVisitor} from "../../../../../core/lang/syntax/visitors/SynNodeVisitor";
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
        this.name = (this.findNthChild(0) as SynTokenNode).getValue();
    }

    resolve(): SynDeclaration | null {
        return this.getParentScope().resolve(this.getName());
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
        } else {
            super.accept(visitor);
        }
    }
}
