import {DebugToolTab} from "../DebugToolTab";
import {HTMLUtils} from "../../../../editor/utils/HTMLUtils";
import {GlobalState} from "../../../../core/global/GlobalState";
import {Editor} from "../../../../editor/Editor";
import {CaretMovedEvent} from "../../../../editor/core/caret/events/CaretMovedEvent";
import {EditorLanguageChanged} from "../../../../editor/core/lang/events/EditorLanguageChanged";
import {MainEditorChangedEvent} from "../../../../app/ui/events/MainEditorChangedEvent";
import {SynFile} from "../../../../lang/syntax/api/filesystem/SynFile";
import {SynTree} from "../../../../lang/syntax/api/tree/SynTree";
import {SynParentElement} from "../../../../lang/syntax/api/tree/SynParentElement";
import {AbstractSynParentElement} from "../../../../lang/syntax/impl/tree/AbstractSynParentElement";
import {SynNode} from "../../../../lang/syntax/api/SynNode";
import {SynErrorNode} from "../../../../lang/syntax/impl/SynErrorNode";
import {SynTokenNode} from "../../../../lang/syntax/impl/SynTokenNode";
import {DocumentModificationEvent} from "../../../../editor/core/document/events/DocumentModificationEvent";
import {EditorHighlighterUtils} from "../../../../editor/ui/highlighter/overlay/EditorHighlighterUtils";
import {TextRange} from "../../../../editor/core/coordinate/range/TextRange";
import {TextAttributeKey} from "../../../../editor/ui/highlighter/style/TextAttributeKey";
import {TextBackground} from "../../../../editor/ui/highlighter/style/TextBackground";
import {SynDocumentManager} from "../../../../lang/syntax/manager/SynDocumentManager";

/**
 *
 * @author Atzitz Amos
 * @date 8/29/2026
 * @since 1.0.0
 */
export class ASTTreeTab extends DebugToolTab {
    private static readonly TEXT_HIGHLIGHT_KEY = TextAttributeKey.of(new TextBackground("rgb(200 96 232 / 0.25)"))

    private element: HTMLElement | null = null;

    getName(): string {
        return "ast";
    }

    getTitle(): string {
        return "AST Viewer";
    }

    init() {
        GlobalState.getMainEventBus().subscribe(this, CaretMovedEvent.SUBSCRIBER, e => {
            if (this.isSelected) {
            }
        });

        GlobalState.getMainEventBus().subscribe(this, DocumentModificationEvent.SUBSCRIBER, e => {
            if (this.element) {
                this.element.querySelector(".ast-refresh-button")?.classList.add("needs-refresh");
            }
        });

        GlobalState.getMainEventBus().subscribe(this, EditorLanguageChanged.SUBSCRIBER, e => {
            if (this.isSelected) {
                this.update(e.getEditor());
            }
        });

        GlobalState.getMainEventBus().subscribe(this, MainEditorChangedEvent.SUBSCRIBER, e => {
            if (this.isSelected) {
                this.update(e.getNewEditor());
            }
        });
    }

    getElement(): HTMLElement {
        if (!this.element) {
            this.element = this.buildElement();
        }

        const editor = GlobalState.getMainEditor();
        if (!editor) return HTMLUtils.html("No opened editor");

        this.update(editor);

        return this.element;
    }

    private buildElement(): HTMLElement {
        return HTMLUtils.createDiv("debug-popup-inner ast-tree-inner popup-tree")
    }

    private update(editor: Editor | null) {
        if (!editor) {
            if (this.element?.parentElement) {
                this.element.parentElement.innerHTML = "No opened editor";
            }
            this.element = null;
            return;
        } else if (!this.element) {
            this.element = this.buildElement();
        }

        this.updateASTTree(SynDocumentManager.getSynDocument(editor.getOpenedDocument()).getSynFile()!);
    }

    private buildASTNode(name: string, data: string | null, range: TextRange | null, parentEl?: HTMLElement): HTMLElement {
        const details = document.createElement("details");
        const summary = document.createElement("summary");

        const titleSpan = document.createElement("span");
        titleSpan.classList.add("node-title");
        titleSpan.textContent = name;

        summary.appendChild(titleSpan);
        if (range) {
            titleSpan.addEventListener("mouseover", e => {
                EditorHighlighterUtils.highlight(
                    GlobalState.getMainEditor(),
                    "ast-viewer",
                    ASTTreeTab.TEXT_HIGHLIGHT_KEY,
                    null,
                    range
                )
            });

            titleSpan.addEventListener("mouseout", e => {
                EditorHighlighterUtils.clear(GlobalState.getMainEditor(), "ast-viewer");
            })
        }

        if (data) {
            const dataSpan = document.createElement("span");
            dataSpan.classList.add("node-data");
            dataSpan.textContent = data;
            summary.appendChild(dataSpan);
        }

        if (range) {
            const rangeSpan = document.createElement("span");
            rangeSpan.classList.add("node-range");
            rangeSpan.textContent = ` ${range}`;
            summary.appendChild(rangeSpan);
        }

        details.appendChild(summary);

        if (parentEl) {
            parentEl.appendChild(details);
        }

        return details;
    }

    private updateASTTree(file: SynFile | undefined) {
        console.log(file);
        if (!this.element) return;
        if (!file) {
            this.element.innerHTML = "No AST available for this file";
            return;
        } else {
            this.element.innerHTML = "";
        }

        const fileNode = this.buildASTNode("SynFile", `(${file.getProjectFile()?.getName() ?? "Unknown File"})`, null);
        const treeNode = this.buildASTNode("SynTree", `(${file.getSynDocument().getLanguage().getDisplayName()})`, file.getSynDocument().getFullRange(), fileNode);

        fileNode.setAttribute("open", "true");
        treeNode.setAttribute("open", "true");

        for (const child of file.getSynDocument().getTree().getChildren()) {
            if (child instanceof AbstractSynParentElement) {
                this.buildASTTreeRecursive(child, treeNode);
            } else {
                this.buildLeafASTNode(child, treeNode);
            }
        }

        this.element.appendChild(fileNode);

        const actionsDiv = HTMLUtils.createDiv("ast-tree-actions");
        actionsDiv.innerHTML = `
            <i class="fa fa-refresh ast-refresh-button"></i>
        `;

        actionsDiv.querySelector("i")?.addEventListener("click", () => {
            this.update(GlobalState.getMainEditor());
        });

        fileNode.querySelector("summary")?.appendChild(actionsDiv);

        this.element.querySelector(".ast-refresh-button")?.classList.remove("needs-refresh");
    }

    private buildASTTreeRecursive(node: SynParentElement, parent: HTMLElement) {
        const nodeName = node.constructor.name;
        const nodeElement = this.buildASTNode(nodeName, null, node.getTextRange(), parent);
        nodeElement.setAttribute("open", "true");

        for (const child of node.getChildren()) {
            if (child instanceof AbstractSynParentElement) {
                this.buildASTTreeRecursive(child, nodeElement);
            } else {
                this.buildLeafASTNode(child, nodeElement);
            }
        }
    }

    private buildLeafASTNode(leaf: SynNode, parentElement: HTMLElement) {
        let nodeElement: HTMLElement;
        if (leaf instanceof SynErrorNode) {
            nodeElement = this.buildASTNode("SynError", `"${leaf.getErrorMessage()}"`, leaf.getTextRange(), parentElement);
            nodeElement.classList.add("error-node");
            nodeElement.classList.add("leaf-node");
        } else if (leaf instanceof SynTokenNode) {
            nodeElement = this.buildASTNode("SynToken", `"${leaf.getValue()}"`, leaf.getTextRange(), parentElement);
            nodeElement.classList.add("token-node");
        }

        nodeElement!.classList.add("leaf-node");
    }
}
