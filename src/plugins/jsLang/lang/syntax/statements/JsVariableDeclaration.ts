import {ASTNode} from "../../../../../core/lang/syntax/builder/parser/nodes/ASTNode";
import {SynTokenNode} from "../../../../../core/lang/syntax/impl/SynTokenNode";
import {JsDeclarator} from "./JsDeclarator";
import {SynNodeVisitor} from "../../../../../core/lang/syntax/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";
import {JsStatement} from "./JsStatement";

/**
 *
 * @author Atzitz Amos
 * @date 6/3/2026
 * @since 1.0.0
 */
export class JsVariableDeclaration extends JsStatement {
    private readonly token: SynTokenNode;
    private readonly declarations: JsDeclarator[];

    constructor(node: ASTNode) {
        super(node);

        this.token = this.getAllToken()[0];
        this.declarations = this.findAllChildrenOfType(JsDeclarator);
    }

    getKindToken(): SynTokenNode {
        return this.token;
    }

    getDeclarations(): JsDeclarator[] {
        return this.declarations;
    }

    isConst(): boolean {
        return this.token.getValue() === "const";
    }

    isVar(): boolean {
        return this.token.getValue() === "var";
    }

    isLet(): boolean {
        return this.token.getValue() === "let";
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitVariableDeclaration(this);
        } else {
            super.accept(visitor);
        }
    }
}
