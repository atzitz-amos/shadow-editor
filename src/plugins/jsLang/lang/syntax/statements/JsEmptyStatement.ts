import {SynElementImpl} from "../../../../../core/lang/syntax/impl/SynElementImpl";
import {SynNodeVisitor} from "../../../../../core/lang/syntax/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../visitors/JsSynVisitor";

/**
 *
 * @author Atzitz Amos
 * @date 6/5/2026
 * @since 1.0.0
 */
export class JsEmptyStatement extends SynElementImpl {
    accept(visitor: SynNodeVisitor) {
        if (visitor instanceof JsSynVisitor) {
            visitor.visitEmptyStatement(this);
        } else {
            super.accept(visitor);
        }
    }
}
