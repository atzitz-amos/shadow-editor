import {SynASTElementImpl} from "../../../../../lang/syntax/impl/tree/SynASTElementImpl";
import {ASTNode} from "../../../../../lang/syntax/builder/parser/nodes/ASTNode";
import {HtmlAttributeName} from "./HtmlAttributeName";
import {HtmlAttributeValue} from "./HtmlAttributeValue";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {HtmlSynVisitor} from "../visitor/HtmlSynVisitor";

/**
 *
 * @author Atzitz Amos
 * @date 9/22/2026
 * @since 1.0.0
 */
export class HtmlAttribute extends SynASTElementImpl {
    constructor(node: ASTNode) {
        super(node);
    }

    getName(): HtmlAttributeName {
        return this.getNthChildOfType(HtmlAttributeName, 0)!;
    }

    getAttributeNameText(): string {
        return this.getName().getText();
    }

    getValue(): HtmlAttributeValue | null {
        return this.getNthChildOfType(HtmlAttributeValue, 0) ?? null;
    }

    hasValue(): boolean {
        return this.getValue() !== null;
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof HtmlSynVisitor) {
            visitor.visitHtmlAttribute(this);
        }

        super.accept(visitor);
    }
}
