import {EditorPlugin, PluginManager} from "../../plugins/Plugins";
import {JS, JSLexer} from "./jsLexer";
import {JSHighlighter} from "./jsHighlighter";
import {JSParser} from "./jsParser";
import {Editor} from "../../Editor";
import {TextContext} from "../../core/coordinate/TextRange";
import {SRNode} from "../../core/lang/parser/ast";
import {ErrorToken, Token, TokenStream} from "../../core/lang/lexer/TokenStream";
import {SrNodeVisitor, SrNodeVisitorImpl} from "../../utils/VisitorUtils";
import {LangEventListener} from "../../core/events/events";
import {JSDeclStmt, JSFuncDecl, JSIdentifier, JSNodeType} from "./jsNodes";
import {JSReference} from "./jsScope";
import {HighlightedToken} from "../../core/lang/highlighter/HighlightedToken";
import {InlineLink} from "../../ui/components/inline/InlineLink";
import {InlayHint} from "../../ui/components/inline/inlays/InlayHint";

export class JSLangPlugin extends EditorPlugin implements LangEventListener {
    name = 'js-lang-plugin';
    description = 'JavaScript Language Plugin for Editor';

    constructor() {
        super();
    }

    onRegistered(editor: Editor, pluginManager: PluginManager) {
        pluginManager.registerFileTypeAssociation(
            "js",
            () => new JSLexer(),
            () => new JSHighlighter(),
            () => new JSParser()
        );

        editor.addLangEventListener("js", this);
    };

    onSrLoaded(editor: Editor, ctx: TextContext, nodes: SRNode[], tokens: TokenStream<JS>) {
        SrNodeVisitor.visitAll<JSNodeType, JS>(nodes, new class implements SrNodeVisitorImpl<JSNodeType, JS> {
            visitNodeIdentifier(node: SRNode) {
                let identifier = node as JSIdentifier;
                let scope = editor.getOpenedDocument().getSrTree().getScopingModel().getScopeAt(identifier.range.begin);
                if (!scope) return;
                let symbol = scope.resolve(identifier.token.value) as JSReference;
                if (!symbol) {
                    editor.addErrorAt(identifier.range, 'js-identifier-not-found', identifier.token.value, `Undefined identifier: ${identifier.token.value}`)
                    return;
                }
                if (symbol.decl.nodeType === JSNodeType.FuncDeclStmt) {
                    editor.getComponentManager().add(new HighlightedToken(identifier.token, "js-function-name"))

                    let decl = symbol.decl as JSFuncDecl;
                    editor.getComponentManager().add(new InlineLink(identifier.token, decl.name!.range.begin));
                }
                if (symbol.decl.nodeType === JSNodeType.DeclStmt) {
                    editor.getComponentManager().add(new HighlightedToken(identifier.token, "js-variable-name"))

                    let decl = symbol.decl as JSDeclStmt;
                    editor.getComponentManager().add(new InlineLink(identifier.token, decl.name!.range.begin));
                }
            }

            visitTokenSyntaxError(token: Token<JS>): void {
                let error = token as ErrorToken<JS>;
                editor.addErrorAt(error.range, "js-syntax-error", error.value, error.msg);
            }

            visitNodeFuncDeclStmt(node: SRNode) {
                let decl = node as JSFuncDecl;
                if (decl.name && !decl.name.isError) {
                    editor.addInlay(new InlayHint(decl.name.range.begin, "fn:"))
                }
            }
        });


    }
}