import {ASTNode} from "../../../../../lang/syntax/builder/parser/nodes/ASTNode";
import {JsStatement} from "../statements/JsStatement";
import {JsClass} from "./JsClass";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";
import {SynTokenNode} from "../../../../../lang/syntax/impl/SynTokenNode";
import {JsCodeBlock} from "../JsCodeBlock";
import {JsClassMember} from "./JsClassMember";
import {JsLexicalGrammar} from "../../lexer/JsLexicalGrammar";
import {JsExpr} from "../expr/JsExpr";

/**
 *
 * @author Atzitz Amos
 * @date 8/5/2026
 * @since 1.0.0
 */
export class JsClassDeclaration extends JsStatement implements JsClass {
    private readonly name: SynTokenNode;
    private readonly extendsExpr: JsExpr | undefined;
    private readonly body: JsCodeBlock;
    private readonly members: JsClassMember[];

    constructor(node: ASTNode) {
        super(node);

        this.name = this.getAllTokensOfType(JsLexicalGrammar.IDENTIFIER)[0];
        this.extendsExpr = this.getNthChildOfType(JsExpr, 0);
        this.body = this.getNthChildOfType(JsCodeBlock, 0)!;

        this.members = this.body?.getAllChildrenOfType(JsClassMember);
    }

    getName(): SynTokenNode {
        return this.name;
    }

    getExtendsExpr(): JsExpr | undefined {
        return this.extendsExpr;
    }

    getBody(): JsCodeBlock {
        return this.body;
    }

    getMembers(): JsClassMember[] {
        return this.members;
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitClassDeclaration(this);
            visitor.visitClass(this);
        }

        super.accept(visitor);
    }
}
