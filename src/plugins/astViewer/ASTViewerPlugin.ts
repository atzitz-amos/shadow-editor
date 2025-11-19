// import {EditorPlugin} from "../../core/plugins/loader/Plugin";
// import {Editor} from "../../editor/Editor";
// import {TextRange} from "../../editor/core/coordinate/TextRange";
// import {ASTTokenNode} from "../../core/lang/ast/nodes/ASTTokenNode";
// import {ASTElementNode} from "../../core/lang/ast/nodes/ASTElementNode";
// import {ASTErrorNode} from "../../core/lang/ast/nodes/ASTErrorNode";
// import {EditorAttachedEvent} from "../../editor/events/EditorAttachedEvent";
//
// export default class ASTViewerPlugin extends EditorPlugin {
//
//     panel: HTMLElement | null = null;
//
//     editor: Editor;
//
//
//     onEnable(editor: Editor) {
//         const self = this;
//
//         this.editor = editor;
//
//         editor.addEditorEventListener(new class extends AbstractEditorEventListener {
//             onHighlightingPerformed(editor: Editor, range: TextRange, tokens: HighlightedToken[]) {
//                 self.update(editor);
//             }
//         });
//
//         editor.getEventBus().subscribe(this, EditorAttachedEvent.SUBSCRIBER, event => {
//             const panel = document.createElement("div");
//             panel.style.position = "relative";
//             panel.style.width = "100%";
//             panel.style.maxWidth = "320px";
//             panel.style.maxHeight = "600px";
//             panel.style.backgroundColor = "#1e1f24";
//             panel.style.color = "#ffffff";
//             panel.style.overflow = "auto";
//             panel.style.padding = "10px";
//             panel.style.marginLeft = "20px";
//             panel.style.fontFamily = "'JETBRAINS', monospace";
//             panel.style.boxShadow = "-3px 3px 20px 1px black, inset 1px 1px 20px #ffffff0d";
//             panel.style.border = "1px solid #93969f";
//             panel.style.boxSizing = "border-box";
//
//             let taskbar = document.createElement("div");
//             taskbar.style.width = "100%";
//             taskbar.style.height = "35px";
//             taskbar.style.backgroundColor = "#2b2d30";
//             taskbar.style.position = "absolute";
//             taskbar.style.top = "0";
//             taskbar.style.left = "0";
//             taskbar.style.borderBottom = "1px solid #93969f";
//             taskbar.style.display = "flex";
//             taskbar.style.alignItems = "center";
//             taskbar.style.paddingLeft = "15px";
//             taskbar.style.boxSizing = "border-box";
//             taskbar.innerText = "AST Viewer";
//
//             let content = document.createElement("div");
//             content.style.paddingTop = "10px";
//             content.style.paddingLeft = "10px";
//             content.style.marginTop = "25px";
//             content.style.width = "100%";
//             content.style.height = "calc(100% - 25px)";
//             content.style.boxSizing = "border-box";
//             content.style.display = "flex";
//             content.style.flexDirection = "column";
//             content.style.flexGrow = "1";
//             content.style.overflow = "auto";
//             content.id = "ast-viewer-content";
//             content.style.fontSize = "10px";
//
//
//             panel.appendChild(taskbar);
//             panel.appendChild(content);
//
//             self.panel = panel;
//
//             event.getRoot().parentElement!.appendChild(panel);
//         });
//     }
//
//     update(editor: Editor) {
//         this.panel!.querySelector("#ast-viewer-content")!.innerHTML = "";
//
//         let lexer = editor.getCurrentLexer();
//         if (!lexer) return;
//         const nodes = editor.parse(lexer.asTokenStream(editor.getOpenedDocument().getTextContent()));
//
//         this.recursiveDisplay(nodes, this.panel!.querySelector("#ast-viewer-content")!);
//     }
//
//     createBlockChild(start: string, end: string, range?: TextRange): HTMLElement {
//         const block = document.createElement("div");
//
//         const collapser = document.createElement("span");
//         collapser.innerText = "▶";
//         collapser.style.cursor = "pointer";
//         collapser.style.userSelect = "none";
//         collapser.style.marginRight = "5px";
//         collapser.onclick = () => {
//             if (blockInner.style.display === "none") {
//                 blockInner.style.display = "block";
//                 collapser.innerText = "▼";
//                 dots.style.display = "none";
//                 // Because of the collapser, we need to align the header and footer properly
//                 footer.style.marginLeft = "11px";
//             } else {
//                 blockInner.style.display = "none";
//                 collapser.innerText = "▶";
//                 dots.style.display = "inline";
//                 footer.style.marginLeft = "0px";
//             }
//         }
//
//         const header = document.createElement("span");
//         header.innerText = start;
//         header.style.color = "#93969f";
//
//         const dots = document.createElement("span");
//         dots.innerText = "...";
//         dots.style.color = "#6a6a6a";
//
//         const blockInner = document.createElement("div");
//         blockInner.style.borderLeft = "1px solid " + "#ffffff";
//         blockInner.style.paddingLeft = "10px";
//         blockInner.style.marginLeft = "13px";
//         blockInner.style.display = "none";
//
//         const footer = document.createElement("span");
//         footer.innerText = end;
//         footer.style.color = "#93969f";
//
//         header.prepend(collapser);
//         block.appendChild(header);
//         block.appendChild(dots);
//         block.appendChild(blockInner);
//         block.appendChild(footer);
//
//         if (range) {
//             this.addHighlighterListener(block, range);
//         }
//
//         collapser.click();
//
//         return block;
//     }
//
//     recursiveDisplay(node: any, root: HTMLElement) {
//         if (Array.isArray(node)) {
//             let block = this.createBlockChild("[", "]");
//             root.appendChild(block);
//             for (let x of node) {
//                 this.recursiveDisplay(x, block.querySelector("div")!);
//             }
//         } else if (node instanceof ASTTokenNode) {
//             const tokenSpan = document.createElement("span");
//             tokenSpan.style.color = "#bac784";
//             tokenSpan.innerText = `"${node.token.getValue()}" [${node.token.getRange().start}, ${node.token.getRange().end}]`;
//             tokenSpan.style.marginBottom = "2px";
//             this.addHighlighterListener(tokenSpan, node.token.getRange());
//             root.appendChild(tokenSpan);
//             root.appendChild(document.createElement("br"));
//         } else if (node instanceof ASTElementNode) {
//             const block = this.createBlockChild(`${node.getType().debugName} {`, `} [${node.getTextRange().start}, ${node.getTextRange().end}]`, node.getTextRange());
//             root.appendChild(block);
//             for (let child of node.getChildren()) {
//                 this.recursiveDisplay(child, block.querySelector("div")!);
//             }
//         } else if (node instanceof ASTErrorNode) {
//             const errorSpan = document.createElement("span");
//             errorSpan.style.color = "#ff6c6b";
//             errorSpan.innerText = `Error: "${node.getErrorMessage()}" [${node.getTextRange().start}, ${node.getTextRange().end}]`;
//             errorSpan.style.marginBottom = "2px";
//             this.addHighlighterListener(errorSpan, node.getTextRange());
//             root.appendChild(errorSpan);
//             root.appendChild(document.createElement("br"));
//         }
//     }
//
//     addHighlighterListener(node: HTMLElement, range: TextRange) {
//         node.onmouseenter = () => {
//             // Dispatch mouse leave to remove previous highlighter
//             if (node.parentElement) {
//                 const event = new MouseEvent("mouseleave", {});
//                 node.parentElement.dispatchEvent(event);
//             }
//
//             node.style.backgroundColor = "#ffffff0d";
//
//             this.editor.getWidgetManager().add(new class extends InlineComponent {
//                 public name: string = "ASTViewerHighlighter";
//                 public range: TextRange = range;
//
//                 constructor() {
//                     super();
//                 }
//
//                 onceRendered() {
//                     setTimeout(() => {
//                         const view = this.view!;
//                         const parent = view.getParentElement()!;
//                         const rect = document.createElement("div");
//
//                         const width = view.getClientWidth() + 2;
//                         const top = view.getClientTop();
//
//
//                         rect.style.position = "absolute";
//                         rect.style.top = top + "px";
//                         rect.style.left = view.getEditor().view.getCharSize() * (range.start - view.getEditor().getOpenedDocument().getLineStart(range.start)) + "px";
//                         rect.style.width = width + "px";
//                         rect.style.height = "100%";
//                         //rect.style.backgroundColor = "#ffff0044";
//                         rect.style.border = "2px solid" + "#2794b5";
//                         rect.style.pointerEvents = "none";
//                         rect.style.zIndex = "10";
//                         parent.style.position = "relative";
//                         parent.appendChild(rect);
//                     }, 0);
//                 }
//             });
//             this.editor.view.triggerRepaint();
//         };
//
//         node.onmouseleave = () => {
//             this.editor.getWidgetManager().removeByName("ASTViewerHighlighter");
//             this.editor.view.triggerRepaint();
//             node.style.backgroundColor = "transparent";
//         };
//     }
// }
