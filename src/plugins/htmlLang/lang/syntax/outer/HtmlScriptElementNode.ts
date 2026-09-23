import {HtmlElementNode} from "../nodes/HtmlElementNode";
import {ASTNode} from "../../../../../lang/syntax/builder/parser/nodes/ASTNode";
import {TextRange} from "../../../../../editor/core/coordinate/range/TextRange";

/**
 *
 * @author Atzitz Amos
 * @date 9/23/2026
 * @since 1.0.0
 */
export class HtmlScriptElementNode extends HtmlElementNode {

    constructor(node: ASTNode) {
        super(node);
    }

    getScriptContent(): string {
        return this.getAllToken()[0].getValue();
    }

    getScriptRange(): TextRange {
        return this.getAllToken()[0].getTextRange();
    }
}
