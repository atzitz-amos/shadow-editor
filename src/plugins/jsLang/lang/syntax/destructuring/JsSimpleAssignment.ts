import {SynTokenNode} from "../../../../../lang/syntax/impl/SynTokenNode";
import {JsAssignmentTarget} from "./target/JsAssignmentTarget";
import {JsExpr} from "../expr/JsExpr";

/**
 *
 * @author Atzitz Amos
 * @date 8/5/2026
 * @since 1.0.0
 */
export class JsSimpleAssignment {
    constructor(private readonly left: SynTokenNode,
                private readonly right: JsAssignmentTarget,
                private readonly defaultValue: JsExpr | undefined = undefined) {
    }

    getLeft(): SynTokenNode {
        return this.left;
    }

    getRight(): JsAssignmentTarget {
        return this.right;
    }

    getDefaultValue(): JsExpr | undefined {
        return this.defaultValue;
    }
}
