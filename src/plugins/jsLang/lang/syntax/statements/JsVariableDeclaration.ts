import {SynElementImpl} from "../../../../../core/lang/syntax/impl/SynElementImpl";
import {ASTNode} from "../../../../../core/lang/syntax/builder/parser/nodes/ASTNode";
import {SynTokenNode} from "../../../../../core/lang/syntax/impl/SynTokenNode";
import {JsDeclarator} from "./JsDeclarator";

/**
 *
 * @author Atzitz Amos
 * @date 6/3/2026
 * @since 1.0.0
 */
export class JsVariableDeclaration extends SynElementImpl {
    private readonly token: SynTokenNode;
    private readonly declarations: JsDeclarator[];

    constructor(node: ASTNode) {
        super(node);

        this.token = this.getAllToken()[0];
        this.declarations = this.findAllChildrenOfType(JsDeclarator);
    }

    getToken(): SynTokenNode {
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
}
