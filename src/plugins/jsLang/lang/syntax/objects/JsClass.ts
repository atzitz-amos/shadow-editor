import {JsClassMember} from "./JsClassMember";
import {JsCodeBlock} from "../JsCodeBlock";
import {SynTokenNode} from "../../../../../lang/syntax/impl/SynTokenNode";
import {JsExpr} from "../expr/JsExpr";

/**
 *
 * @author Atzitz Amos
 * @date 8/5/2026
 * @since 1.0.0
 */
export interface JsClass {
    getName(): SynTokenNode | undefined;

    getExtendsExpr(): JsExpr | undefined;

    getBody(): JsCodeBlock;

    getMembers(): JsClassMember[];
}
