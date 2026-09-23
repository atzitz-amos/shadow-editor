import {ASTGrammar} from "../../../../lang/syntax/builder/parser/nodes/ASTGrammar";
import {HtmlElementNode} from "../syntax/nodes/HtmlElementNode";
import {HtmlVoidElementNode} from "../syntax/nodes/HtmlVoidElementNode";
import {HtmlTextNode} from "../syntax/nodes/HtmlTextNode";
import {HtmlEntityNode} from "../syntax/misc/HtmlEntityNode";
import {HtmlOpenTag} from "../syntax/misc/HtmlOpenTag";
import {HtmlCloseTag} from "../syntax/misc/HtmlCloseTag";
import {HtmlAttribute} from "../syntax/attribute/HtmlAttribute";
import {HtmlAttributeName} from "../syntax/attribute/HtmlAttributeName";
import {HtmlAttributeValue} from "../syntax/attribute/HtmlAttributeValue";
import {HtmlDoctypeNode} from "../syntax/misc/HtmlDoctypeNode";
import {HtmlTagBody} from "../syntax/nodes/HtmlTagBody";
import {HtmlScriptElementNode} from "../syntax/outer/HtmlScriptElementNode";

/**
 *
 * @author Atzitz Amos
 * @date 9/22/2026
 * @since 1.0.0
 */
export class HtmlGrammar {
    public static readonly HtmlNodeChildren = ASTGrammar.create("NodeChildren", HtmlTagBody.builder());
    public static readonly DoctypeNode = ASTGrammar.create("DoctypeNode", HtmlDoctypeNode.builder());

    public static readonly ElementNode = ASTGrammar.create("ElementNode", HtmlElementNode.builder());
    public static readonly VoidElementNode = ASTGrammar.create("VoidElementNode", HtmlVoidElementNode.builder());
    public static readonly TextNode = ASTGrammar.create("TextNode", HtmlTextNode.builder());
    public static readonly HtmlEntityNode = ASTGrammar.create("HtmlEntityNode", HtmlEntityNode.builder());

    public static readonly OpenTagNode = ASTGrammar.create("OpenTagNode", HtmlOpenTag.builder());
    public static readonly CloseTagNode = ASTGrammar.create("CloseTagNode", HtmlCloseTag.builder());

    public static readonly SelfClosingTagNode = ASTGrammar.create("SelfClosingTagNode", HtmlOpenTag.builder());
    public static readonly Attribute = ASTGrammar.create("Attribute", HtmlAttribute.builder());
    public static readonly AttributeName = ASTGrammar.create("AttributeName", HtmlAttributeName.builder());
    public static readonly AttributeValue = ASTGrammar.create("AttributeValue", HtmlAttributeValue.builder());

    public static readonly ScriptNode = ASTGrammar.create("ScriptNode", HtmlScriptElementNode.builder());
    public static readonly StyleContentNode = ASTGrammar.create("StyleNode");
}
