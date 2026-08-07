import {JsExpr} from "./JsExpr";
import {ASTNode} from "../../../../../lang/syntax/builder/parser/nodes/ASTNode";

/**
 *
 * @author Atzitz Amos
 * @date 8/5/2026
 * @since 1.0.0
 */
export class JsArrayDestructuringPatternExpr extends JsExpr {
    constructor(node: ASTNode) {
        super(node);
    }
}
