import {SynASTElement} from "../../../../../lang/syntax/api/tree/SynASTElement";
import {JsClassPropertyKey, JsComputedPropertyName, JsPrivatePropertyName} from "./JsClassPropertyKey";
import {JsIdentifier} from "../literal/JsIdentifier";
import {SynTokenNode} from "../../../../../lang/syntax/impl/SynTokenNode";
import {JsExpr} from "../expr/JsExpr";

/**
 *
 * @author Atzitz Amos
 * @date 8/5/2026
 * @since 1.0.0
 */
export class JsClassUtils {
    public static getClassMemberName(cls: SynASTElement, startIndex: number): JsClassPropertyKey {
        const element = cls.getNthChild(startIndex, true);
        if (element instanceof JsIdentifier) return element;
        if (element instanceof SynTokenNode && element.getValue() === "[") {
            return new JsComputedPropertyName(
                element,
                cls.getNthChild(startIndex + 1, true) as JsExpr,
                cls.getNthChild(startIndex + 2, true) as SynTokenNode);
        }
        if (element instanceof SynTokenNode && element.getValue() === "#") {
            return new JsPrivatePropertyName(element, cls.getNthChild(startIndex + 1, true) as JsIdentifier);
        }
        return undefined as unknown as JsClassPropertyKey;
    }
}
