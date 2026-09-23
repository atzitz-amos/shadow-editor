/**
 *
 * @author Atzitz Amos
 * @date 9/22/2026
 * @since 1.0.0
 */
export class HtmlParsingUtils {
    private static readonly VOID_ELEMENTS = new Set([
        "area",
        "base",
        "br",
        "col",
        "embed",
        "hr",
        "img",
        "input",
        "link",
        "meta",
        "param",
        "source",
        "track",
        "wbr"
    ]);

    private static readonly HTML_ENTITIES: { [key: string]: string } = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    };

    public static isVoidElement(tagName: string): boolean {
        return HtmlParsingUtils.VOID_ELEMENTS.has(tagName.toLowerCase());
    }

    public static isTagAllowed(tagName: string, inBody: boolean, inHead: boolean) {
        const lowerTagName = tagName.toLowerCase();
        if (inBody) {
            // In body, all tags are allowed except for <html>, <head>, and <body>
            return lowerTagName !== "html" && lowerTagName !== "head" && lowerTagName !== "body";
        } else if (inHead) {
            // In head, only <title>, <base>, <link>, <meta>, <style>, and <script> are allowed
            return ["title", "base", "link", "meta", "style", "script"].includes(lowerTagName);
        } else {
            // At top level, only <html> is allowed
            return lowerTagName === "html";
        }
    }

    static decodeHtmlEntity(text: string) {
        var element = document.createElement('div');

        text = text.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
        text = text.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
        element.innerHTML = text;
        text = element.textContent;
        element.textContent = '';

        return text;
    }
}
