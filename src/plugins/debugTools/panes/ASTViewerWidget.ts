import {UIComponent} from "../../../core/ui/engine/components/UIComponent";
import {HTMLUtils} from "../../../editor/utils/HTMLUtils";
import {SynNode} from "../../../core/lang/syntax/api/SynNode";
import {SynASTElementImpl} from "../../../core/lang/syntax/impl/tree/SynASTElementImpl";
import {SynFileImpl} from "../../../core/lang/syntax/impl/filesystem/SynFileImpl";
import {SynTokenNode} from "../../../core/lang/syntax/impl/SynTokenNode";
import {SynErrorNode} from "../../../core/lang/syntax/impl/SynErrorNode";
import {SynRecursiveIterator} from "../../../core/lang/syntax/utils/visitors/SynRecursiveIterator";
import {AstOverlayHighlight} from "../overlays/AstOverlayHighlight";
import {Editor} from "../../../editor/Editor";
import {SynDocument} from "../../../core/lang/syntax/api/document/SynDocument";
import {SynDocumentImpl} from "../../../core/lang/syntax/impl/document/SynDocumentImpl";
import {SynTreeImpl} from "../../../core/lang/syntax/impl/tree/SynTreeImpl";

/**
 *
 * @author Atzitz Amos
 * @date 6/3/2026
 * @since 1.0.0
 */
export class ASTViewerWidget extends UIComponent {
    private synDocument: SynDocument | null = null;
    private editor: Editor | null = null;

    private scrollTop: number = 0;
    private scrollLeft: number = 0;

    private collapsedNodes: Set<string> = new Set();

    private followingElement: HTMLElement | null;

    constructor() {
        super(HTMLUtils.createDiv("ast-viewer-widget"));
    }

    public onCaretMoved(offset: Offset) {
        if (!this.editor || !this.synDocument) return;
        const root = this.getChildren()[0] as SynTreeNode;

        let node = root.getNode();
        let tree = root;
        while (true) {
            if (node instanceof SynASTElementImpl || node instanceof SynFileImpl) {
                let foundChild = false;
                for (const child of tree.getChildren()) {
                    const childNode = (child as SynTreeNode).getNode();
                    const range = childNode.getTextRange();
                    if (range.start <= offset && offset <= range.end) {
                        node = childNode;
                        tree = child as SynTreeNode;
                        foundChild = true;
                        break;
                    }
                }
                if (!foundChild) {
                    break;
                }
            } else {
                break;
            }
        }

        // Scroll to the corresponding node in the AST viewer
        this.followingElement = tree.getUnderlyingElement();
    }

    public draw(): void {
        this.setInnerHTML("");
        if (!this.synDocument) {
            this.setInnerHTML(`<div class="ast-viewer-placeholder">No file loaded</div>`);
            return;
        }
        const header = HTMLUtils.createElement("header.ast-viewer-header");
        header.innerHTML = `
           <div class="ast-viewer-header-left">
                <div class="overline"> AST VIEWER</div>
                <div class="ast-viewer-filename">${this.synDocument.getAssociatedFile()?.getName() ?? "unknown file"}</div>
           </div>
           
           <div class="ast-viewer-header-right">
                <div class="ast-viewer-toggle-follow"><i class="fa-solid fa-location-crosshairs"></i></div>
           </div>
        `;

        header.querySelector(".ast-viewer-toggle-follow")?.addEventListener("click", () => {
            if (this.followingElement) {
                this.followingElement.scrollIntoView({behavior: "smooth", block: "center"});
                this.followingElement.style.border = "1px solid red";
            }
        });

        const body = HTMLUtils.createDiv("ast-viewer-body");

        this.addChild(new SynTreeNode(this, body, this.synDocument.getTree()));

        this.addHtmlElement(header);
        this.addHtmlElement(body);
        this.drawChildren();

        // Restore scroll position after redraw
        body.scrollTop = this.scrollTop;
        body.scrollLeft = this.scrollLeft;

    }

    onSynTreeChanged(editor: Editor, synDocument: SynDocument) {
        // Save scroll position before redraw
        const body = this.getUnderlyingElement()?.querySelector(".ast-viewer-body");
        if (body) {
            this.scrollTop = body.scrollTop;
            this.scrollLeft = body.scrollLeft;
        }

        this.synDocument = synDocument;
        this.editor = editor;
        if (this.synDocument) {
            let newCollapsedNodes = new Set<string>();
            for (const node of new SynRecursiveIterator(this.synDocument.getTree())) {
                if (this.wasCollapsed(node)) {
                    newCollapsedNodes.add(node.toTreeRepr());
                }
            }
            this.collapsedNodes = newCollapsedNodes;
        }

        this.draw();
    }

    wasCollapsed(node: SynNode) {
        if (!(node instanceof SynASTElementImpl)) return false;
        return this.collapsedNodes.has(node.toTreeRepr());
    }

    setCollapsed(node: SynNode, b: boolean) {
        if (b) {
            this.collapsedNodes.add(node.toTreeRepr());
        } else {
            this.collapsedNodes.delete(node.toTreeRepr());
        }
    }

    mouseOverNode(node: SynNode) {
        if (!this.editor) return;
        this.editor.getWidgetManager().removeByName("ast-viewer-hover-highlight");

        const range = node.getTextRange();
        this.editor.getWidgetManager().addOverlayWidget(new AstOverlayHighlight(range));
        this.editor.getView().triggerOverlaysRepaint();
    }

    mouseOutNode(node: SynNode) {
        if (!this.editor) return;
        this.editor.getWidgetManager().removeByName("ast-viewer-hover-highlight");
        this.editor.getView().triggerOverlaysRepaint();
    }
}


class SynTreeNode extends UIComponent {
    private collapsed: boolean = false;

    private body: HTMLElement;

    public constructor(private readonly component: ASTViewerWidget, root: HTMLElement, private readonly node: SynNode, private readonly tag: string | null = null) {
        super(HTMLUtils.createElement("div.syn-tree-node", root));

        this.collapsed = component.wasCollapsed(node);
    }

    drawElement(): void {
        const title = HTMLUtils.createElement("span.syn-tree-node-title");
        title.addEventListener("click", () => {
            this.setCollapsed(!this.collapsed);
        });

        title.addEventListener("mouseenter", () => {
            this.component.mouseOverNode(this.node);
            for (const child of this.getChildren()) {
                (child as SynTreeNode).setTagVisible(true);
            }
        });

        title.addEventListener("mouseleave", () => {
            this.component.mouseOutNode(this.node);
            for (const child of this.getChildren()) {
                (child as SynTreeNode).setTagVisible(false);
            }
        });

        if (this.collapsed) {
            title.innerHTML = this.withTagComponent(`${this.node.constructor.name} { ... }`);
            this.addHtmlElement(title);
            return;
        }

        title.innerHTML = this.withTagComponent(`${this.node.constructor.name} {`);

        this.addHtmlElement(title);

        this.body = HTMLUtils.createDiv("syn-tree-node-body");
        for (const child of this.node.getChildren()) {
            this.addChild(new SynTreeNode(this.component, this.body, child, this.getTagForChild(child)));
        }
        const closing = HTMLUtils.createDiv("syn-tree-node-closing");

        closing.innerText = `}`;
        this.addHtmlElement(this.body);
        this.addHtmlElement(closing);

        this.drawChildren();
    }

    drawToken() {
        const title = HTMLUtils.createElement("span.syn-tree-node-title.syn-token-node");
        title.innerHTML = this.withTagComponent(`Token("${(this.node as SynTokenNode).getValue()}")`);

        title.addEventListener("mouseenter", () => {
            this.component.mouseOverNode(this.node);
        });

        title.addEventListener("mouseleave", () => {
            this.component.mouseOutNode(this.node);
        });

        this.addHtmlElement(title);
    }

    drawError() {
        const title = HTMLUtils.createElement("span.syn-tree-node-title.syn-error-node");
        title.innerHTML = this.withTagComponent(`#Error("${(this.node as SynErrorNode).getErrorMessage()}")`);
        this.addHtmlElement(title);
    }

    draw() {
        this.setInnerHTML("");

        if (this.node instanceof SynASTElementImpl || this.node instanceof SynTreeImpl) {
            this.drawElement();
        } else if (this.node instanceof SynTokenNode) {
            this.drawToken();
        } else if (this.node instanceof SynErrorNode) {
            this.drawError();
        }
    }

    getNode(): SynNode {
        return this.node;
    }

    setCollapsed(b: boolean) {
        this.collapsed = b;
        if (this.collapsed) {
            this.component.setCollapsed(this.node, true);
        } else {
            this.component.setCollapsed(this.node, false);
        }
        this.draw();
    }

    setTagVisible(b: boolean) {
        if (b) {
            let title = this.getUnderlyingElement().querySelector(".syn-tree-node-title");
            if (title)
                title.querySelector(".ast-viewer-tag")?.classList.add("visible");
        } else {
            let title = this.getUnderlyingElement().querySelector(".syn-tree-node-title");
            if (title)
                title.querySelector(".ast-viewer-tag")?.classList.remove("visible");
        }
    }

    private getTagForChild(child: SynNode): string | null {
        for (const key in this.node) {
            if (!["file", "parent", "children", "elementChildren"].includes(key) && this.node.hasOwnProperty(key)) {
                const value = (this.node as any)[key];
                if (Array.isArray(value)) {
                    if (value.includes(child)) {
                        return key;
                    }
                } else if (value === child) {
                    return key;
                }
            }
        }

        return null;
    }

    private withTagComponent(original: string): string {
        if (this.tag) {
            return `${original} <span class="ast-viewer-tag">${this.tag}</span>`;
        }
        return original;
    }
}