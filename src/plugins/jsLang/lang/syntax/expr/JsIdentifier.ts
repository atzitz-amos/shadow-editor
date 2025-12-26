import {SynElementImpl} from "../../../../../core/lang/builder/syntax/impl/SynElementImpl";
import {SynSymbol} from "../../../../../core/lang/builder/syntax/api/SynSymbol";
import {ASTNode} from "../../../../../core/lang/builder/parser/nodes/ASTNode";
import {SynTokenNode} from "../../../../../core/lang/builder/syntax/impl/SynTokenNode";
import {SynDeclaration} from "../../../../../core/lang/builder/syntax/impl/SynDeclaration";

/**
 *
 * @author Atzitz Amos
 * @date 12/11/2025
 * @since 1.0.0
 */
export class JsIdentifier extends SynElementImpl implements SynSymbol {
    private readonly name: string;

    constructor(node: ASTNode) {
        super(node);
        this.name = (<SynTokenNode>node.children[0]).getValue();
    }

    resolve(): SynDeclaration | null {
        return this.getParentScope().resolve(this.getName());
    }

    getName(): string {
        return this.name;
    }
}
