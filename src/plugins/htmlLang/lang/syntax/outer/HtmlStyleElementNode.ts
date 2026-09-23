import {ASTNode} from "../../../../../lang/syntax/builder/parser/nodes/ASTNode";
import {TextRange} from "../../../../../editor/core/coordinate/range/TextRange";
import {HtmlElementNode} from "../nodes/HtmlElementNode";

/**
 *
 * @author Atzitz Amos
 * @date 9/23/2026
 * @since 1.0.0
 */
export class HtmlStyleElementNode extends HtmlElementNode {

    constructor(node: ASTNode) {
        super(node);
    }

    getStyleContent(): string {
        return this.getAllToken()[0].getValue();
    }

    getStyleRange(): TextRange {
        return this.getAllToken()[0].getTextRange();
    }
}
