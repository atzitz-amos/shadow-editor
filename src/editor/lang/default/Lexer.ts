import {RegExpLexer} from "../../core/lang/lexer/RegExprLexer";
import {LazyTokenStream, TokenStream} from "../../core/lang/lexer/TokenStream";

export enum DefaultTokenType {
    DEFAULT = "Default",
    EOL = "EOL",
    EOF = "EOF"
}


export class DefaultLexer extends RegExpLexer<DefaultTokenType> {

    constructor() {
        super();

        this.setRules([
            {matcher: /\r\n|\n|\r/, type: DefaultTokenType.EOL},
            {matcher: /([^\r\n]+)/, type: DefaultTokenType.DEFAULT},  // everything except nl
        ]);

        this.setEOF(DefaultTokenType.EOF);
        this.setSpecial(DefaultTokenType.EOL);
    }

    asTokenStream(text: string): TokenStream<DefaultTokenType> {
        return new LazyTokenStream(this, text);
    }
}
