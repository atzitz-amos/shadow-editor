import {JsFunctionParameters} from "../statements/JsFunctionParameters";
import {JsCodeBlock} from "../JsCodeBlock";
import {SynTokenNode} from "../../../../../lang/syntax/impl/SynTokenNode";

/**
 *
 * @author Atzitz Amos
 * @date 7/3/2026
 * @since 1.0.0
 */
export interface JsFunction {
    getNameToken(): SynTokenNode | null;

    getAsyncToken(): SynTokenNode | undefined;

    getParameters(): JsFunctionParameters;

    getBody(): JsCodeBlock;

    isFunctionExpr(): boolean;

    isAsync(): boolean;

    isGenerator(): boolean;
}
