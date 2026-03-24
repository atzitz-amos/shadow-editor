import {SynDeclaration} from "../../../../../core/lang/syntax/impl/SynDeclaration";
import {ASTNode} from "../../../../../core/lang/syntax/builder/parser/nodes/ASTNode";
import {SynElement} from "../../../../../core/lang/syntax/api/SynElement";
import {SynTokenNode} from "../../../../../core/lang/syntax/impl/SynTokenNode";
import {SynErrorNode} from "../../../../../core/lang/syntax/impl/SynErrorNode";

/**
 *
 * @author Atzitz Amos
 * @date 12/17/2025
 * @since 1.0.0
 */
export class JsDeclarator extends SynDeclaration {
    private readonly name: SynTokenNode;
    private readonly equToken: SynTokenNode | null = null;
    private readonly expr: SynElement | null = null;

    constructor(node: ASTNode) {
        super(node);

        this.name = <SynTokenNode>node.children[0];
        if (node.children.length > 1) {
            this.equToken = <SynTokenNode>node.children[1];
            this.expr = <SynElement>node.children[2];
        }
    }

    isInitialized(): boolean {
        return this.expr !== null;
    }

    getName(): string {
        return (this.name instanceof SynErrorNode) ? "" : this.name.getValue();
    }

    getEQToken(): SynTokenNode | null {
        return this.equToken;
    }

    getExpression(): SynElement | null {
        return this.expr;
    }
}
