import {JsStatement} from "./JsStatement";
import {ASTNode} from "../../../../../lang/syntax/builder/parser/nodes/ASTNode";
import {SynASTElement} from "../../../../../lang/syntax/api/tree/SynASTElement";

/**
 *
 * @author Atzitz Amos
 * @date 6/13/2026
 * @since 1.0.0
 */
export class JsIfStatement extends JsStatement {

    constructor(node: ASTNode) {
        super(node);
    }
}
