import {UIComponent} from "../../../core/ui/engine/components/UIComponent";
import {HTMLUtils} from "../../../editor/utils/HTMLUtils";
import {SynNode} from "../../../core/lang/syntax/api/SynNode";
import {SynFile} from "../../../core/lang/syntax/api/SynFile";
import {SynElementImpl} from "../../../core/lang/syntax/impl/SynElementImpl";
import {SynFileImpl} from "../../../core/lang/syntax/impl/SynFileImpl";
import {SynTokenNode} from "../../../core/lang/syntax/impl/SynTokenNode";
import {SynErrorNode} from "../../../core/lang/syntax/impl/SynErrorNode";
import {SynRecursiveIterator} from "../../../core/lang/syntax/visitors/SynRecursiveIterator";
import {AstOverlayHighlight} from "../overlays/AstOverlayHighlight";
import {Editor} from "../../../editor/Editor";

/**
 *
 * @author Atzitz Amos
 * @date 6/3/2026
 * @since 1.0.0
 */
export class ASTViewerWidget extends UIComponent {
    private synFile: SynFile | null = null;
    private editor: Editor | null = null;

    private scrollTop: number = 0;
    private scrollLeft: number = 0;

    private collapsedNodes: Set<string> = new Set();

    private isFollowing: boolean = false;

    constructor() {
        super(HTMLUtils.createDiv("ast-viewer-widget"));
    }

    public onCaretMoved(offset: Offset) {
        if (!this.editor || !this.synFile) return;
        if (!this.isFollowing) return;
        const root = this.getChildren()[0] as SynTreeNode;

        let node = root.getNode();
        let tree = root;
        while (true) {
            if (node instanceof SynElementImpl || node instanceof SynFileImpl) {
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
        const element = tree.getUnderlyingElement();
        if (element) {
            element.scrollIntoView({behavior: "smooth", block: "center"});
        }
    }

    public draw(): void {
        this.setInnerHTML("");
        if (!this.synFile) {
            this.setInnerHTML(`<div class="ast-viewer-placeholder">No file loaded</div>`);
            return;
        }
        const header = HTMLUtils.createElement("header.ast-viewer-header");
        header.innerHTML = `
           <div class="ast-viewer-header-left">
                <div class="overline"> AST VIEWER</div>
                <div class="ast-viewer-filename">${this.synFile.getWorkspaceFile()?.getName() ?? "unknown file"}</div>
           </div>
           
           <div class="ast-viewer-header-right">
                <div class="ast-viewer-toggle-follow"><i class="fa-solid fa-location-crosshairs"></i></div>
           </div>
        `;

        header.querySelector(".ast-viewer-toggle-follow")?.addEventListener("click", () => {
            this.isFollowing = !this.isFollowing;
            if (this.isFollowing) {
                header.querySelector(".ast-viewer-toggle-follow")?.classList.add("is-active");
            } else {
                header.querySelector(".ast-viewer-toggle-follow")?.classList.remove("is-active");
            }
        });

        const body = HTMLUtils.createDiv("ast-viewer-body");

        this.addChild(new SynTreeNode(this, body, this.synFile));

        this.addHtmlElement(header);
        this.addHtmlElement(body);
        this.drawChildren();

        // Restore scroll position after redraw
        body.scrollTop = this.scrollTop;
        body.scrollLeft = this.scrollLeft;

    }

    onSynTreeChanged(editor: Editor, synFile: SynFile) {
        // Save scroll position before redraw
        const body = this.getUnderlyingElement()?.querySelector(".ast-viewer-body");
        if (body) {
            this.scrollTop = body.scrollTop;
            this.scrollLeft = body.scrollLeft;
        }

        this.synFile = synFile;
        this.editor = editor;
        if (this.synFile) {
            let newCollapsedNodes = new Set<string>();
            for (const node of new SynRecursiveIterator(this.synFile)) {
                if (this.wasCollapsed(node)) {
                    newCollapsedNodes.add(node.toTreeRepr());
                }
            }
            this.collapsedNodes = newCollapsedNodes;
        }

        this.draw();
    }

    wasCollapsed(node: SynNode) {
        if (!(node instanceof SynElementImpl)) return false;
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

        if (this.node instanceof SynElementImpl || this.node instanceof SynFileImpl) {
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