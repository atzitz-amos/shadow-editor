import {JsFunctionParameters} from "../statements/JsFunctionParameters";
import {JsCodeBlock} from "../JsCodeBlock";

/**
 *
 * @author Atzitz Amos
 * @date 7/3/2026
 * @since 1.0.0
 */
export interface JsFunction {
    getName(): string | null;

    getParameters(): JsFunctionParameters;

    getBody(): JsCodeBlock;

    isFunctionExpr(): boolean;

    isAsync(): boolean;

    isGenerator(): boolean;
}
