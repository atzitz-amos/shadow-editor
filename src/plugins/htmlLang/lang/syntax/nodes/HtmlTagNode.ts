import {HtmlNode} from "./HtmlNode";
import {ASTNode} from "../../../../../lang/syntax/builder/parser/nodes/ASTNode";
import {HtmlOpenTag} from "../misc/HtmlOpenTag";
import {HtmlTagBody} from "./HtmlTagBody";
import {HtmlCloseTag} from "../misc/HtmlCloseTag";
import {HtmlAttribute} from "../attribute/HtmlAttribute";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {HtmlSynVisitor} from "../visitor/HtmlSynVisitor";

/**
 *
 * @author Atzitz Amos
 * @date 9/22/2026
 * @since 1.0.0
 */
export abstract class HtmlTagNode extends HtmlNode {

    constructor(node: ASTNode) {
        super(node);
    }

    isUnclosed(): boolean {
        return this.getCloseTag() === null;
    }

    getOpenTag(): HtmlOpenTag {
        return this.getNthChildOfType(HtmlOpenTag, 0)!;
    }

    getAttributes(): HtmlAttribute[] {
        return this.getOpenTag().getAttributes();
    }

    getBody(): HtmlTagBody | null {
        return this.getNthChildOfType(HtmlTagBody, 0) ?? null;
    }

    getCloseTag(): HtmlCloseTag | null {
        return this.getNthChildOfType(HtmlCloseTag, 0) ?? null;
    }

    getTagName(): string {
        return this.getOpenTag().getTagName().getValue();
    }

    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof HtmlSynVisitor) {
            visitor.visitTagNode(this);
        }

        super.accept(visitor);
    }
}
