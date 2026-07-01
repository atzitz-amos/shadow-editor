import {ASTNode} from "../../../../../core/lang/syntax/builder/parser/nodes/ASTNode";
import {SynNodeVisitor} from "../../../../../core/lang/syntax/utils/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";
import {JsExpr} from "./JsExpr";
import {SynTokenNode} from "../../../../../core/lang/syntax/impl/SynTokenNode";

/**
 *
 * @author Atzitz Amos
 * @date 11/27/2025
 * @since 1.0.0
 */
export class JsMemberAccessExpr extends JsExpr {
    private readonly object: JsExpr;
    private readonly property: SynTokenNode;

    constructor(node: ASTNode) {
        super(node);
        this.object = this.getNthChild(0) as JsExpr;
        this.property = this.getNthChild(2) as SynTokenNode;
    }

    getObject(): JsExpr {
        return this.object;
    }

    getProperty(): SynTokenNode {
        return this.property;
    }

    isOptionalChaining(): boolean {
        return this.getAllToken()[0].getValue() === "?.";
    }

    public toDebugString(): string {
        return `(${this.object.toDebugString()}.${this.property.getValue()})`;
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitMemberAccessExpr(this);
        }

        super.accept(visitor);
    }
}
