import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {HtmlAttribute} from "../attribute/HtmlAttribute";
import {HtmlAttributeName} from "../attribute/HtmlAttributeName";
import {HtmlAttributeValue} from "../attribute/HtmlAttributeValue";
import {HtmlCloseTag} from "../misc/HtmlCloseTag";
import {HtmlOpenTag} from "../misc/HtmlOpenTag";
import {HtmlDoctypeNode} from "../misc/HtmlDoctypeNode";
import {HtmlEntityNode} from "../misc/HtmlEntityNode";
import {HtmlNode} from "../nodes/HtmlNode";
import {HtmlTextNode} from "../nodes/HtmlTextNode";
import {HtmlTagBody} from "../nodes/HtmlTagBody";
import {HtmlTagNode} from "../nodes/HtmlTagNode";
import {HtmlVoidElementNode} from "../nodes/HtmlVoidElementNode";
import {HtmlElementNode} from "../nodes/HtmlElementNode";

/**
 *
 * @author Atzitz Amos
 * @date 9/22/2026
 * @since 1.0.0
 */
export class HtmlSynVisitor extends SynNodeVisitor {
    public visitHtmlAttribute(element: HtmlAttribute) {
    }

    public visitHtmlAttributeName(element: HtmlAttributeName) {
    }

    public visitHtmlAttributeValue(element: HtmlAttributeValue) {
    }

    public visitOpenTag(element: HtmlOpenTag) {
    }

    public visitTagBody(element: HtmlTagBody) {
    }

    public visitCloseTag(element: HtmlCloseTag) {
    }

    public visitHtmlDoctype(element: HtmlDoctypeNode) {
    }

    public visitHtmlEntity(element: HtmlEntityNode) {
    }

    public visitHtmlNode(element: HtmlNode) {
    }

    public visitHtmlTextNode(element: HtmlTextNode) {
    }

    public visitHtmlTagNode(element: HtmlTagNode) {
    }

    public visitTagNode(element: HtmlTagNode) {
    }

    public visitHtmlElementNode(element: HtmlElementNode) {
    }

    public visitVoidElementNode(element: HtmlVoidElementNode) {
    }
}
