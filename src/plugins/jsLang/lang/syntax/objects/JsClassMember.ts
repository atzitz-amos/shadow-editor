import {SynASTElementImpl} from "../../../../../lang/syntax/impl/tree/SynASTElementImpl";
import {ASTNode} from "../../../../../lang/syntax/builder/parser/nodes/ASTNode";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";
import {JsClassPropertyKey} from "./JsClassPropertyKey";
import {SynTokenNode} from "../../../../../lang/syntax/impl/SynTokenNode";

/**
 *
 * @author Atzitz Amos
 * @date 8/5/2026
 * @since 1.0.0
 */
export abstract class JsClassMember extends SynASTElementImpl {
    constructor(node: ASTNode) {
        super(node);
    }

    abstract getName(): JsClassPropertyKey;

    abstract getStaticToken(): SynTokenNode | undefined;

    isStatic(): boolean {
        return this.getStaticToken() !== undefined;
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitClassMember(this);
        }

        super.accept(visitor);
    }
}
