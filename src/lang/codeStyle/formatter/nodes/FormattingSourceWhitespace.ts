import {FormattingNode} from "./FormattingNode";
import {Token} from "../../../syntax/builder/tokens/Token";

/**
 *
 * @author Atzitz Amos
 * @date 9/4/2026
 * @since 1.0.0
 */
export class FormattingSourceWhitespace extends FormattingNode {

    constructor(private readonly whitespace: Token | null, private readonly isIndentation: boolean) {
        super();
    }

    public isIndentationWhitespace(): boolean {
        return this.isIndentation;
    }

    public getWhitespaceToken(): Token | null {
        return this.whitespace;
    }

    getLength() {
        if (this.whitespace) {
            return this.whitespace.getValue().length;
        }
        return 0;
    }
}
