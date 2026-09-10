import {FormattingNode} from "./FormattingNode";
import {Token} from "../../../syntax/builder/tokens/Token";

/**
 *
 * @author Atzitz Amos
 * @date 9/4/2026
 * @since 1.0.0
 */
export class FormattingText extends FormattingNode {

    constructor(private readonly token: Token) {
        super();
    }

    getToken(): Token {
        return this.token;
    }

    getText() {
        return this.token.getValue();
    }
}
