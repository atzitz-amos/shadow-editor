import {ASTNode} from "../../../../../lang/syntax/builder/parser/nodes/ASTNode";
import {JsClassMember} from "./JsClassMember";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";
import {SynASTElementImpl} from "../../../../../lang/syntax/impl/tree/SynASTElementImpl";
import {SynTokenNode} from "../../../../../lang/syntax/impl/SynTokenNode";

/**
 *
 * @author Atzitz Amos
 * @date 9/17/2026
 * @since 1.0.0
 */
export class JsClassBody extends SynASTElementImpl {
    private readonly members: JsClassMember[];

    constructor(node: ASTNode) {
        super(node);

        this.members = this.getAllChildrenOfType(JsClassMember);
    }

    getMembers(): JsClassMember[] {
        return this.members;
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitClassBody(this);
        }
    }

    getOpeningBrace() {
        return this.previousSibling() as SynTokenNode;
    }

    getClosingBrace() {
        return this.nextSibling() as SynTokenNode;
    }
}
