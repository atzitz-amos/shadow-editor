import {IParser} from "../../../../lang/syntax/builder/parser/IParser";
import {ASTBuilder} from "../../../../lang/syntax/builder/parser/builder/ASTBuilder";
import {HtmlLexicalGrammar} from "../lexer/HtmlLexicalGrammar";
import {HtmlGrammar} from "./HtmlGrammar";
import {HtmlParsingUtils} from "./HtmlParsingUtils";
import {Token} from "../../../../lang/syntax/builder/tokens/Token";


export enum HtmlStartingContext {
    TOPLEVEL,
    HTML,
    HEAD,
    BODY,
    FRAGMENT
}

/**
 *
 * @author Atzitz Amos
 * @date 9/22/2026
 * @since 1.0.0
 */
export class HtmlParser implements IParser {
    private isInHtml: boolean = false;
    private isInBody: boolean = false;
    private isInHead: boolean = false;

    private activeElementStack: string[] = [];

    constructor(private readonly builder: ASTBuilder, private readonly context: HtmlStartingContext = HtmlStartingContext.TOPLEVEL) {
        if (context == HtmlStartingContext.BODY) {
            this.isInHtml = false;
            this.isInBody = true;
        } else if (context == HtmlStartingContext.HEAD) {
            this.isInHtml = false;
            this.isInHead = true;
        } else if (context === HtmlStartingContext.HTML) {
            this.isInHtml = true;
        } else if (context == HtmlStartingContext.FRAGMENT) {
            this.isInHtml = false;
            this.isInBody = false;
            this.isInHead = false;
        }
    }

    parse(): void {
        const marker = this.builder.mark();

        this.parseDoctype();
        while (!this.builder.done()) {
            this.parseNode();
        }

        marker.done(HtmlGrammar.HtmlNodeChildren);
    }

    isTagValidInContext(name: string) {
        if (this.isInHtml) {
            if (name === "html") return false;
            if (name === "body") {
                this.isInHtml = false;
                this.isInBody = true;
                return true;
            } else if (name === "head") {
                this.isInHtml = false;
                this.isInHead = true;
                return true;
            }
            this.isInHtml = false;
            this.isInBody = true;
            return true;
        } else if (this.isInBody) {
            return HtmlParsingUtils.isTagAllowed(name, true, false);
        } else if (this.isInHead) {
            return HtmlParsingUtils.isTagAllowed(name, false, true);
        } else {
            if (name === "html") {
                this.isInHtml = true;
                return true;
            } else if (name === "head") {
                this.isInHead = true;
                return true;
            }
            this.isInBody = true;
            return true;
        }
    }

    private parseDoctype() {
        // The lexer doesn't produce a dedicated DOCTYPE token: "<!DOCTYPE html>"
        // comes through as a TEXT token "<!" followed by ordinary TEXT tokens.
        if (!this.builder.isNext(HtmlLexicalGrammar.TEXT)) return;
        const bangToken = this.builder.seek()!;
        if (bangToken.getValue() !== "<!") return;

        const mark = this.builder.mark();
        this.builder.advance(); // consume "<!"

        const nameToken = this.builder.isNext(HtmlLexicalGrammar.TEXT) ? this.builder.seek() : null;
        if (!nameToken || nameToken.getValue().toUpperCase() !== "DOCTYPE") {
            // Not actually a doctype (e.g. stray "<!" in text). Don't lose the
            // token — just emit it as text and let normal parsing continue.
            mark.done(HtmlGrammar.TextNode);
            return;
        }
        this.builder.advance(); // consume "DOCTYPE"

        while (!this.builder.done() && !this.builder.isNext(HtmlLexicalGrammar.TAG_CLOSE_BRACKET)) {
            this.builder.advance();
        }
        if (this.builder.isNext(HtmlLexicalGrammar.TAG_CLOSE_BRACKET)) {
            this.builder.advance();
        } else {
            this.builder.errorOn(bangToken, `Unterminated <!DOCTYPE ...> declaration`);
        }

        mark.done(HtmlGrammar.DoctypeNode);
    }

    private parseNode() {
        const token = this.builder.seek();
        if (!token) return;
        if (token.isType(HtmlLexicalGrammar.TAG_OPEN_BRACKET)) {
            this.parseTag();
        } else if (token.isType(HtmlLexicalGrammar.TAG_SLASH_OPEN_BRACKET)) {
            // Stray closing tag with nothing open to match it against.
            this.parseClosingTag();
            this.builder.popAndError(`Unexpected closing tag: ${token.getValue()}`);
        } else if (token.isType(HtmlLexicalGrammar.TEXT)) {
            this.parseText();
        } else {
            this.builder.advance();
            this.builder.popAndError(`Unexpected token: ${token.getValue()}`);
        }
    }

    private parseTag() {
        const tagMarker = this.builder.mark();
        const openTagMarker = this.builder.mark();
        this.builder.advance(); // consume '<'
        const tagNameToken = this.builder.expect(HtmlLexicalGrammar.TAG_NAME).require();
        if (!tagNameToken) return tagMarker.done(HtmlGrammar.TextNode);

        if (!this.isTagValidInContext(tagNameToken.getValue().toLowerCase())) {
            this.builder.errorOn(tagNameToken, `Tag "<${tagNameToken.getValue()}>" is not allowed here`);
        }

        while (
            !this.builder.done() &&
            !this.builder.isNext(HtmlLexicalGrammar.TAG_CLOSE_BRACKET) &&
            !this.builder.isNext(HtmlLexicalGrammar.TAG_SLASH_CLOSE_BRACKET)
            ) {
            const marker = this.builder.mark();
            const keyMarker = this.builder.mark();
            const attribute = this.builder.expect(HtmlLexicalGrammar.TAG_ATTRIBUTE_NAME).orError(`Expected attribute name`);
            if (!attribute) {
                // Guarantee forward progress: without this, a token that is
                // neither an attribute name, '>', nor '/>' (e.g. a stray quote
                // or '<') leaves the loop condition unchanged and hangs forever.
                if (
                    !this.builder.done() &&
                    !this.builder.isNext(HtmlLexicalGrammar.TAG_CLOSE_BRACKET) &&
                    !this.builder.isNext(HtmlLexicalGrammar.TAG_SLASH_CLOSE_BRACKET)
                ) {
                    this.builder.advance();
                }
                continue;
            }
            keyMarker.done(HtmlGrammar.AttributeName);

            const valueMarker = this.builder.mark();
            if (this.builder.isNext(HtmlLexicalGrammar.EQUALS)) {
                this.builder.advance(); // consume '='
                if (this.builder.isNext(HtmlLexicalGrammar.STRING)) {
                    this.builder.advance(); // consume string
                }
            }
            valueMarker.done(HtmlGrammar.AttributeValue);
            marker.done(HtmlGrammar.Attribute);
        }

        if (this.builder.isNext(HtmlLexicalGrammar.TAG_SLASH_CLOSE_BRACKET)) {
            this.builder.advance(); // consume '/>'
            openTagMarker.done(HtmlGrammar.SelfClosingTagNode);
            tagMarker.done(HtmlGrammar.VoidElementNode);
            return;
        }

        this.builder.expect(HtmlLexicalGrammar.TAG_CLOSE_BRACKET).orError(`Unexpected EOF`);
        openTagMarker.done(HtmlGrammar.OpenTagNode);

        if (tagNameToken.getValue() === "script") {
            this.builder.consumeIf(HtmlLexicalGrammar.SCRIPT_CONTENT);
            this.parseClosingTag(tagNameToken);
            return tagMarker.done(HtmlGrammar.ScriptNode);
        } else if (tagNameToken.getValue() === "style") {
            this.builder.consumeIf(HtmlLexicalGrammar.STYLE_CONTENT);
            this.parseClosingTag(tagNameToken);
            return tagMarker.done(HtmlGrammar.StyleContentNode);
        }

        if (HtmlParsingUtils.isVoidElement(tagNameToken.getValue())) {
            tagMarker.done(HtmlGrammar.VoidElementNode);
            return;
        }

        this.parseTagBody(tagNameToken);

        tagMarker.done(HtmlGrammar.ElementNode);
    }

    /**
     * Looks at an upcoming "</name>" without consuming it, so a caller can decide
     * whether this close tag belongs to it or to an ancestor before committing.
     * Returns the lowercased tag name, or null if the next token isn't a close tag
     * or has no name.
     */
    private peekCloseTagName(): string | null {
        if (!this.builder.isNext(HtmlLexicalGrammar.TAG_SLASH_OPEN_BRACKET)) return null;

        const marker = this.builder.mark();
        this.builder.advance(); // '</'
        const nameToken = this.builder.isNext(HtmlLexicalGrammar.TAG_NAME) ? this.builder.seek() : null;
        marker.rollback(); // pure lookahead — put the tokens back

        return nameToken ? nameToken.getValue().toLowerCase() : null;
    }

    private parseClosingTag(tagNameToken?: Token) {
        const closeTagMarker = this.builder.mark();
        if (this.builder.isNext(HtmlLexicalGrammar.TAG_SLASH_OPEN_BRACKET)) {
            this.builder.advance(); // consume '</'
            const closeTagNameToken = this.builder.expect(HtmlLexicalGrammar.TAG_NAME).orError(`Expected tag name`);
            if (tagNameToken && closeTagNameToken && closeTagNameToken.getValue().toLowerCase() !== tagNameToken.getValue().toLowerCase()) {
                this.builder.errorOn(closeTagNameToken, `Mismatched closing tag. Expected </${tagNameToken.getValue()}> but found </${closeTagNameToken.getValue()}>`);
            }
            this.builder.expect(HtmlLexicalGrammar.TAG_CLOSE_BRACKET).orError(`Unexpected character`);
        }
        closeTagMarker.done(HtmlGrammar.CloseTagNode);
    }

    private parseText() {
        const textMarker = this.builder.mark();
        this.builder.advance();
        while (this.builder.isNext(HtmlLexicalGrammar.TEXT) || this.builder.isNext(HtmlLexicalGrammar.HTML_ENTITY)) {
            if (this.builder.seek()?.isType(HtmlLexicalGrammar.HTML_ENTITY)) {
                const marker = this.builder.mark();
                this.builder.advance();
                marker.done(HtmlGrammar.HtmlEntityNode);
            } else {
                this.builder.advance();
            }
        }
        textMarker.done(HtmlGrammar.TextNode);
    }

    private parseTagBody(name: Token) {
        const marker = this.builder.mark();

        const tagName = name.getValue().toLowerCase();
        this.activeElementStack.push(tagName);
        let closed = false;

        while (!this.builder.done()) {
            if (this.builder.isNext(HtmlLexicalGrammar.TAG_SLASH_OPEN_BRACKET)) {
                const closeName = this.peekCloseTagName();

                if (closeName === tagName) {
                    marker.done(HtmlGrammar.HtmlNodeChildren);
                    this.parseClosingTag(name);
                    closed = true;
                    break;
                }

                if (closeName !== null && this.activeElementStack.includes(closeName)) {
                    // Belongs to an ancestor further up the stack: this element is
                    // implicitly unclosed here. Leave the close tag unconsumed so
                    // that ancestor's own loop can consume it.
                    break;
                }

                // Matches nothing currently open: a stray close tag. Discard it
                // and keep parsing the rest of this element's body.
                this.parseClosingTag();
                this.builder.popAndError(`Unexpected closing tag: </${closeName ?? "?"}>`);
            } else if (this.builder.isNext(HtmlLexicalGrammar.TAG_OPEN_BRACKET)) {
                this.parseTag();
            } else if (this.builder.isNext(HtmlLexicalGrammar.TEXT) || this.builder.isNext(HtmlLexicalGrammar.HTML_ENTITY)) {
                this.parseText();
            } else {
                this.builder.advance();
                this.builder.popAndError(`Unexpected token: ${this.builder.seek()?.getValue()}`);
            }
        }

        if (!closed) {
            // Either EOF was hit, or an ancestor's close tag ended this element implicitly.
            this.builder.errorOn(name, `Unclosed tag <${tagName}>`);
            marker.done(HtmlGrammar.HtmlNodeChildren);
        }

        this.activeElementStack.pop();
    }
}